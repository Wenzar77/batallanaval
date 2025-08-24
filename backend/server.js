// server.js — ESM
import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import crypto from 'crypto';
import { TRIVIA_BANK } from './data/trivia.js';

const PORT = process.env.PORT || 3000;
const SIZE = 20;
const SHIPS = [5, 4, 3, 3, 2, 2, 2];
const TRIVIA_PROB = 0.35;
const TRIVIA_TIME = 15_000;
const WEAPONS = ['doubleShot', 'bomb3x3', 'crossMissile', 'radar'];
const TEAM_NAMES = { A: 'Jaguares', B: 'Guacamayas' };

// Puntaje
const PTS_HIT = 10;
const PTS_SINK = 30;
const PTS_TRIVIA = 15;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const server = createServer(app);
const distPath = join(__dirname, 'dist');

app.use(express.static(distPath));

const wss = new WebSocketServer({ server, path: '/ws' });

// ===== utilidades =====
const uuid = () => crypto.randomUUID();
const randomChoice = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Código de sala sin I/O/0/1 para evitar confusiones
const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
function generateCode(rooms, length = 5) {
  let code = '';
  do {
    code = '';
    for (let i = 0; i < length; i++) {
      const idx = crypto.randomInt(0, CODE_ALPHABET.length);
      code += CODE_ALPHABET[idx];
    }
  } while (rooms.has(code));
  return code;
}

function emptyBoard() {
  return Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
}
function placeShipsRandomly() {
  const b = emptyBoard();
  let shipId = 1;
  for (const len of SHIPS) {
    let placed = false;
    for (let tries = 0; tries < 1000 && !placed; tries++) {
      const horiz = Math.random() < 0.5;
      const x = Math.floor(Math.random() * SIZE);
      const y = Math.floor(Math.random() * SIZE);
      if (horiz) {
        if (y + len <= SIZE) {
          let ok = true;
          for (let j = 0; j < len; j++) if (b[x][y + j] !== 0) { ok = false; break; }
          if (ok) { for (let j = 0; j < len; j++) b[x][y + j] = shipId; placed = true; shipId++; }
        }
      } else {
        if (x + len <= SIZE) {
          let ok = true;
          for (let i = 0; i < len; i++) if (b[x + i][y] !== 0) { ok = false; break; }
          if (ok) { for (let i = 0; i < len; i++) b[x + i][y] = shipId; placed = true; shipId++; }
        }
      }
    }
    if (!placed) console.warn('No se pudo colocar barco de tamaño', len);
  }
  return b;
}
function coordsInBomb3x3(x, y) {
  const c = [];
  for (let i = x - 1; i <= x + 1; i++)
    for (let j = y - 1; j <= y + 1; j++)
      if (i >= 0 && i < SIZE && j >= 0 && j < SIZE) c.push([i, j]);
  return c;
}
function coordsInCross(x, y) {
  const c = [];
  for (let i = 0; i < SIZE; i++) c.push([i, y]);
  for (let j = 0; j < SIZE; j++) if (j !== y) c.push([x, j]);
  return c;
}
function countShipsRemaining(board, enemyHitsSet) {
  if (!board) return 0;
  const shipCells = new Map();
  for (let i = 0; i < SIZE; i++) {
    for (let j = 0; j < SIZE; j++) {
      const v = board[i][j];
      if (v > 0) shipCells.set(v, (shipCells.get(v) || 0) + 1);
    }
  }
  for (const key of enemyHitsSet) {
    const [i, j] = key.split(',').map(Number);
    const v = board[i][j];
    if (v > 0) shipCells.set(v, (shipCells.get(v) || 0) - 1);
  }
  let remaining = 0;
  for (const [, cells] of shipCells) if (cells > 0) remaining++;
  return remaining;
}
function isShipSunk(board, shipId, enemyHitsSet) {
  for (let i = 0; i < SIZE; i++) {
    for (let j = 0; j < SIZE; j++) {
      if (board[i][j] === shipId) {
        const key = `${i},${j}`;
        if (!enemyHitsSet.has(key)) return false;
      }
    }
  }
  return true;
}

// ===== estado =====
/*
room = {
  code, state, players(Map), clients(Set), boards, hits, misses, weapons,
  turnTeam, turnPlayerId, triviaPending,
  scores: { teams:{A,B}, players: Map<playerId, points> },
  sunk: { A: Set<shipId>, B: Set<shipId> }
}
*/
const rooms = new Map();

// clientId -> { code, playerId }
const byClient = new Map();

function makeSnapshot(room) {
  const hasBoards = !!(room.boards?.A && room.boards?.B);
  const playerScoresArray = Array.from(room.players.values()).map(p => ({
    id: p.id,
    name: p.name,
    team: p.team,
    points: room.scores?.players.get(p.id) ?? 0,
  }));

  return {
    code: room.code,
    state: room.state,
    turnTeam: room.turnTeam,
    teamNames: TEAM_NAMES,
    turnPlayerId: room.turnPlayerId,
    players: Array.from(room.players.values()).map(p => ({ id: p.id, name: p.name, team: p.team })),
    weapons: { A: room.weapons.A, B: room.weapons.B },
    shipsRemaining: {
      A: hasBoards ? countShipsRemaining(room.boards.A, room.hits.B) : 0,
      B: hasBoards ? countShipsRemaining(room.boards.B, room.hits.A) : 0,
    },
    gridSize: SIZE,
    history: {
      A: Array.from(room.hits.A),
      B: Array.from(room.hits.B),
      Amiss: Array.from(room.misses.A),
      Bmiss: Array.from(room.misses.B),
    },
    scores: {
      teams: { A: room.scores?.teams.A ?? 0, B: room.scores?.teams.B ?? 0 },
      players: playerScoresArray,
    },
    trivia: room.triviaPending
      ? {
          nonce: room.triviaPending.nonce,
          toTeam: room.triviaPending.toTeam,
          allowedPlayerId: room.triviaPending.allowedPlayerId,
          timeout: room.triviaPending.timeout,
        }
      : null,
  };
}

const broadcast = (room, payload) => {
  const data = JSON.stringify(payload);
  for (const client of room.clients) { try { client.send(data); } catch { } }
};

// ===== WS =====
wss.on('connection', (ws) => {
  ws.id = uuid();
  ws.roomCode = null;

  ws.on('message', (msg) => {
    let data; try { data = JSON.parse(msg); } catch { return; }
    const type = data.type;

    if (type === 'changeTeam') {
      const room = rooms.get(ws.roomCode);
      if (!room) return;
      const player = room.players.get(ws.id);
      if (!player) return;
      player.team = player.team === 'A' ? 'B' : 'A';
      broadcast(room, { type: 'roomUpdate', snapshot: makeSnapshot(room) });
      return;
    }

    // ------- Crear sala -------
    if (type === 'createRoom') {
      const playerId = data.clientId || ws.id;
      const code = generateCode(rooms, 5);

      const room = {
        code, state: 'lobby',
        players: new Map(), clients: new Set(),
        boards: { A: null, B: null },
        hits: { A: new Set(), B: new Set() },
        misses: { A: new Set(), B: new Set() },
        weapons: { A: [], B: [] },
        turnTeam: Math.random() < 0.5 ? 'A' : 'B',
        turnPlayerId: null,
        triviaPending: null,
        scores: { teams: { A: 0, B: 0 }, players: new Map() },
        sunk: { A: new Set(), B: new Set() },
      };
      rooms.set(code, room);

      room.clients.add(ws);
      ws.roomCode = code;

      const player = {
        id: playerId,
        name: data.name || 'Host',
        team: data.team === 'B' ? 'B' : 'A',
        disconnectedAt: null,
      };
      room.players.set(playerId, player);
      room.scores.players.set(playerId, room.scores.players.get(playerId) ?? 0);

      // El socket representa a ese playerId
      ws.id = playerId;
      byClient.set(playerId, { code, playerId });

      ws.send(JSON.stringify({ type: 'roomCreated', code }));
      broadcast(room, { type: 'roomUpdate', snapshot: makeSnapshot(room) });
      return;
    }

    // ------- Unirse a sala (o reconectar) -------
    if (type === 'joinRoom') {
      const room = rooms.get(data.code);
      if (!room) { ws.send(JSON.stringify({ type: 'error', message: 'Sala no existe' })); return; }

      const playerId = data.clientId || ws.id;
      ws.id = playerId;
      room.clients.add(ws);
      ws.roomCode = room.code;

      let player = room.players.get(playerId);
      if (player) {
        if (data.name) player.name = data.name;
        if (data.team === 'A' || data.team === 'B') player.team = data.team;
        player.disconnectedAt = null;
      } else {
        player = {
          id: playerId,
          name: data.name || 'Jugador',
          team: data.team === 'B' ? 'B' : 'A',
          disconnectedAt: null,
        };
        room.players.set(playerId, player);
      }

      room.scores.players.set(playerId, room.scores.players.get(playerId) ?? 0);
      byClient.set(playerId, { code: room.code, playerId });
      broadcast(room, { type: 'roomUpdate', snapshot: makeSnapshot(room) });
      return;
    }

    // ------- Reanudar sesión -------
    if (type === 'resume') {
      const { code, clientId } = data;
      const room = rooms.get(code);
      if (!room) { ws.send(JSON.stringify({ type: 'toast', message: 'Sala no existe' })); return; }

      ws.id = clientId;
      ws.roomCode = code;

      const player = room.players.get(clientId);
      if (!player) {
        ws.send(JSON.stringify({ type: 'toast', message: 'No hay jugador para reanudar' }));
        return;
      }

      room.clients.add(ws);
      player.disconnectedAt = null;
      byClient.set(clientId, { code, playerId: clientId });

      try { ws.send(JSON.stringify({ type: 'resumed' })); } catch {}
      broadcast(room, { type: 'roomUpdate', snapshot: makeSnapshot(room) });
      return;
    }

    // ------- Iniciar juego -------
    if (type === 'startGame') {
      const room = rooms.get(ws.roomCode); if (!room) return;
      room.boards.A = placeShipsRandomly();
      room.boards.B = placeShipsRandomly();
      room.hits = { A: new Set(), B: new Set() };
      room.misses = { A: new Set(), B: new Set() };
      room.weapons = { A: [], B: [] };
      room.triviaPending = null;
      room.state = 'active';
      room.turnPlayerId = null;
      room.sunk = { A: new Set(), B: new Set() };
      room.scores = {
        teams: { A: 0, B: 0 },
        players: new Map(Array.from(room.players.keys()).map(id => [id, room.scores.players.get(id) ?? 0])),
      };
      broadcast(room, { type: 'roomUpdate', snapshot: makeSnapshot(room) });
      return;
    }

    // ------- Disparo -------
    if (type === 'fire') {
      const room = rooms.get(ws.roomCode); if (!room || room.state !== 'active') return;
      const shooter = room.players.get(ws.id); if (!shooter) return;
      const team = shooter.team;
      if (team !== room.turnTeam) { ws.send(JSON.stringify({ type: 'error', message: 'No es tu turno' })); return; }

      const { x, y, weapon } = data;
      let targets = [[x, y]];
      if (weapon === 'bomb3x3') targets = coordsInBomb3x3(x, y);
      if (weapon === 'crossMissile') targets = coordsInCross(x, y);

      const enemy = team === 'A' ? 'B' : 'A';
      let anyHit = false;
      const shipIdsHit = new Set();

      for (const [i, j] of targets) {
        const key = `${i},${j}`;
        if (room.hits[team].has(key) || room.misses[team].has(key)) continue;
        const v = room.boards[enemy][i][j];
        if (v > 0) {
          room.hits[team].add(key);
          anyHit = true;
          shipIdsHit.add(v);
          room.scores.players.set(ws.id, (room.scores.players.get(ws.id) ?? 0) + PTS_HIT);
          room.scores.teams[team] += PTS_HIT;
        } else {
          room.misses[team].add(key);
        }
      }

      if (weapon && weapon !== 'doubleShot') {
        const idx = room.weapons[team].indexOf(weapon);
        if (idx >= 0) room.weapons[team].splice(idx, 1);
      }

      room.turnPlayerId = shooter.id;

      for (const shipId of shipIdsHit) {
        if (!room.sunk[team].has(shipId) && isShipSunk(room.boards[enemy], shipId, room.hits[team])) {
          room.sunk[team].add(shipId);
          room.scores.players.set(ws.id, (room.scores.players.get(ws.id) ?? 0) + PTS_SINK);
          room.scores.teams[team] += PTS_SINK;
        }
      }

      if (!anyHit) {
        room.turnTeam = enemy;
        room.turnPlayerId = null;
      }

      const remainingEnemy = countShipsRemaining(room.boards[enemy], room.hits[team]);
      if (remainingEnemy === 0) {
        room.state = `finished_${team}`;
        broadcast(room, { type: 'roomUpdate', snapshot: makeSnapshot(room) });
        return;
      }

      // === TRIVIA ===
      if (room.state === 'active' && Math.random() < TRIVIA_PROB && !room.triviaPending) {
        const card = randomChoice(TRIVIA_BANK);
        const nonce = uuid();

        room.triviaPending = {
          toTeam: team,
          allowedPlayerId: shooter.id,
          nonce,
          answer: card.a,
          timeout: Date.now() + TRIVIA_TIME
        };

        // Envía a todos, pero marca canAnswer solo para el jugador autorizado
        for (const client of room.clients) {
          try {
            if (client.readyState !== 1) continue; // 1 === OPEN
            const canAnswer = (client.id === shooter.id);
            const payload = {
              type: 'trivia',
              card: { q: card.q, opts: card.opts },
              nonce,
              canAnswer,
              playerName: shooter.name,
              team: team,
              allowedPlayerId: shooter.id
            };
            client.send(JSON.stringify(payload));
          } catch { }
        }

        setTimeout(() => {
          if (room.triviaPending && room.triviaPending.nonce === nonce) {
            room.triviaPending = null;

            // cerrar la trivia por timeout en todos los clientes
            broadcast(room, {
              type: 'triviaEnd',
              nonce,
              reason: 'timeout'
            });

            broadcast(room, { type: 'roomUpdate', snapshot: makeSnapshot(room) });
          }
        }, TRIVIA_TIME + 1000);
      }

      broadcast(room, { type: 'roomUpdate', snapshot: makeSnapshot(room) });
      return;
    }

    // ------- Responder trivia -------
    if (type === 'answerTrivia') {
      const room = rooms.get(ws.roomCode); if (!room || !room.triviaPending) return;
      const { nonce, answerIndex } = data;
      const pending = room.triviaPending;

      if (pending.nonce !== nonce) return;

      const expired = Date.now() > pending.timeout;
      const team = pending.toTeam;
      let correct = false;

      if (!expired) {
        if (ws.id !== pending.allowedPlayerId) {
          try { ws.send(JSON.stringify({ type: 'toast', message: '❌ No puedes responder. Le toca al jugador en turno.' })); } catch { }
          return;
        }
        correct = (answerIndex === pending.answer);

        if (correct) {
          const prize = randomChoice(WEAPONS);
          room.weapons[team].push(prize);
          room.scores.players.set(ws.id, (room.scores.players.get(ws.id) ?? 0) + PTS_TRIVIA);
          room.scores.teams[team] += PTS_TRIVIA;
          broadcast(room, { type: 'toast', message: `🏆 ¡${team} gana arma: ${prize}!` });
        } else {
          broadcast(room, { type: 'toast', message: '⏰ Respuesta incorrecta. Sin premio.' });
        }
      } else {
        broadcast(room, { type: 'toast', message: '⏳ La pregunta expiró.' });
      }

      const endPayload = {
        type: 'triviaEnd',
        nonce,
        reason: expired ? 'timeout' : 'answered',
        correct,
        answeredBy: expired ? null : ws.id,
        team
      };

      room.triviaPending = null;
      broadcast(room, endPayload);
      broadcast(room, { type: 'roomUpdate', snapshot: makeSnapshot(room) });
      return;
    }

  });

  ws.on('close', () => {
    if (!ws.roomCode) return;
    const room = rooms.get(ws.roomCode);
    if (!room) return;

    // quita SOLO el socket de la lista de clientes activos
    room.clients.delete(ws);

    // marca al jugador como desconectado, NO lo borres aún
    const player = room.players.get(ws.id);
    if (player) {
      player.disconnectedAt = Date.now();
    }

    broadcast(room, { type: 'roomUpdate', snapshot: makeSnapshot(room) });

    // Limpieza diferida: si en 10 min no volvió, entonces sí elimínalo
    setTimeout(() => {
      const still = rooms.get(ws.roomCode);
      if (!still) return;
      const p = still.players.get(ws.id);
      if (p && p.disconnectedAt && Date.now() - p.disconnectedAt > 10 * 60 * 1000) {
        still.players.delete(ws.id);
        still.scores?.players?.delete(ws.id);
        broadcast(still, { type: 'roomUpdate', snapshot: makeSnapshot(still) });
      }
    }, 10 * 60 * 1000);
  });
});

// Healthcheck
app.get('/health', (_req, res) => res.status(200).send('ok'));

// SPA fallback (excluye /ws)
app.get(/^\/(?!ws).*$/, (_req, res) => {
  res.sendFile(join(distPath, 'index.html'));
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ HTTP+WS escuchando en 0.0.0.0:${PORT}  (WS en /ws)`);
});
