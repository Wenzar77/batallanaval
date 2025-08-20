// server.js — ESM
import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import crypto from 'crypto';

const PORT = process.env.PORT || 3000;
const SIZE = 20;
const SHIPS = [5, 4, 3, 3, 2, 2, 2];
const TRIVIA_PROB = 0.35;
const TRIVIA_TIME = 15_000;
const WEAPONS = ['doubleShot', 'bomb3x3', 'crossMissile', 'radar'];

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const server = createServer(app);
const distPath = join(__dirname, 'dist');

// 1) Estáticos
app.use(express.static(distPath));

// 2) WebSocket en /ws
const wss = new WebSocketServer({ server, path: '/ws' });

// ===== utilidades =====
function emptyBoard() { return Array.from({ length: SIZE }, () => Array(SIZE).fill(0)); }
function placeShipsRandomly() {
  const b = emptyBoard(); let shipId = 1;
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
function coordsInBomb3x3(x, y) { const c = []; for (let i = x - 1; i <= x + 1; i++)for (let j = y - 1; j <= y + 1; j++) if (i >= 0 && i < SIZE && j >= 0 && j < SIZE) c.push([i, j]); return c; }
function coordsInCross(x, y) { const c = []; for (let i = 0; i < SIZE; i++) c.push([i, y]); for (let j = 0; j < SIZE; j++) if (j !== y) c.push([x, j]); return c; }
function countShipsRemaining(board, enemyHitsSet) {
  // Si aún no hay tablero (lobby), reporta 0 sin fallar
  if (!board) return 0;

  const shipCells = new Map(); // shipId -> count
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

const randomChoice = (arr) => arr[Math.floor(Math.random() * arr.length)];
const uuid = () => crypto.randomUUID();

import { TRIVIA_BANK } from './data/trivia.js';

// ===== estado de salas =====
const rooms = new Map();
function makeSnapshot(room) {
  const hasBoards = !!(room.boards?.A && room.boards?.B);

  return {
    code: room.code,
    state: room.state,
    turnTeam: room.turnTeam,
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
  };
}

const broadcast = (room, payload) => {
  const data = JSON.stringify(payload);
  for (const client of room.clients) { try { client.send(data); } catch { } }
};

// ===== WS handlers =====
wss.on('connection', (ws) => {
  ws.id = uuid();
  ws.roomCode = null;

  ws.on('message', (msg) => {
    let data; try { data = JSON.parse(msg); } catch { return; }
    const type = data.type;

    if (type === 'createRoom') {
      const code = (Math.random().toString(36).slice(2, 8)).toUpperCase();
      const room = {
        code, state: 'lobby', players: new Map(), clients: new Set(),
        boards: { A: null, B: null }, hits: { A: new Set(), B: new Set() }, misses: { A: new Set(), B: new Set() },
        weapons: { A: [], B: [] }, turnTeam: Math.random() < 0.5 ? 'A' : 'B', triviaPending: null
      };
      rooms.set(code, room);
      room.clients.add(ws); ws.roomCode = code;
      const player = { id: ws.id, name: data.name || 'Host', team: data.team === 'B' ? 'B' : 'A' };
      room.players.set(ws.id, player);
      ws.send(JSON.stringify({ type: 'roomCreated', code }));
      broadcast(room, { type: 'roomUpdate', snapshot: makeSnapshot(room) });
      return;
    }

    if (type === 'joinRoom') {
      const room = rooms.get(data.code);
      if (!room) { ws.send(JSON.stringify({ type: 'error', message: 'Sala no existe' })); return; }
      room.clients.add(ws); ws.roomCode = room.code;
      const player = { id: ws.id, name: data.name || 'Jugador', team: data.team === 'B' ? 'B' : 'A' };
      room.players.set(ws.id, player);
      broadcast(room, { type: 'roomUpdate', snapshot: makeSnapshot(room) });
      return;
    }

    if (type === 'startGame') {
      const room = rooms.get(ws.roomCode); if (!room) return;
      room.boards.A = placeShipsRandomly();
      room.boards.B = placeShipsRandomly();
      room.hits = { A: new Set(), B: new Set() };
      room.misses = { A: new Set(), B: new Set() };
      room.weapons = { A: [], B: [] };
      room.triviaPending = null;
      room.state = 'active';
      broadcast(room, { type: 'roomUpdate', snapshot: makeSnapshot(room) });
      return;
    }

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

      for (const [i, j] of targets) {
        const key = `${i},${j}`;
        if (room.hits[team].has(key) || room.misses[team].has(key)) continue;
        const v = room.boards[enemy][i][j];
        if (v > 0) { room.hits[team].add(key); anyHit = true; }
        else { room.misses[team].add(key); }
      }

      if (weapon && weapon !== 'doubleShot') {
        const idx = room.weapons[team].indexOf(weapon);
        if (idx >= 0) room.weapons[team].splice(idx, 1);
      }

      if (!anyHit) room.turnTeam = enemy;

      const remainingEnemy = countShipsRemaining(room.boards[enemy], room.hits[team]);
      if (remainingEnemy === 0) {
        room.state = `finished_${team}`;
        broadcast(room, { type: 'roomUpdate', snapshot: makeSnapshot(room) });
        return;
      }

      if (room.state === 'active' && Math.random() < TRIVIA_PROB && !room.triviaPending) {
        const card = randomChoice(TRIVIA_BANK);
        const nonce = uuid();
        room.triviaPending = { toTeam: team, nonce, answer: card.a, timeout: Date.now() + TRIVIA_TIME };

        for (const client of room.clients) {
          const p = room.players.get(client.id);
          if (p && p.team === team) {
            try { client.send(JSON.stringify({ type: 'trivia', card: { q: card.q, opts: card.opts }, nonce })); } catch { }
          }
        }

        setTimeout(() => {
          if (room.triviaPending && room.triviaPending.nonce === nonce) {
            room.triviaPending = null;
            broadcast(room, { type: 'roomUpdate', snapshot: makeSnapshot(room) });
          }
        }, TRIVIA_TIME + 1000);
      }

      broadcast(room, { type: 'roomUpdate', snapshot: makeSnapshot(room) });
      return;
    }

    if (type === 'answerTrivia') {
      const room = rooms.get(ws.roomCode); if (!room || !room.triviaPending) return;
      const { nonce, answerIndex } = data;
      const pending = room.triviaPending;
      if (pending.nonce !== nonce) return;
      if (Date.now() > pending.timeout) { room.triviaPending = null; return; }

      const correct = (answerIndex === pending.answer);
      const team = pending.toTeam;
      room.triviaPending = null;

      if (correct) {
        const prize = randomChoice(WEAPONS);
        room.weapons[team].push(prize);
        broadcast(room, { type: 'toast', message: `🏆 ¡${team} gana arma: ${prize}!` });
      } else {
        broadcast(room, { type: 'toast', message: '⏰ Respuesta incorrecta. Sin premio.' });
      }
      broadcast(room, { type: 'roomUpdate', snapshot: makeSnapshot(room) });
      return;
    }
  });

  ws.on('close', () => {
    if (!ws.roomCode) return;
    const room = rooms.get(ws.roomCode);
    if (!room) return;
    room.clients.delete(ws);
    room.players.delete(ws.id);
    broadcast(room, { type: 'roomUpdate', snapshot: makeSnapshot(room) });
  });
});

app.get('/health', (_req,res)=>res.status(200).send('ok'));

// 3) Fallback SPA: usa REGEX que excluye /ws y evita '*'
app.get(/^\/(?!ws).*$/, (_req, res) => {
  res.sendFile(join(distPath, 'index.html'));
});

server.listen(PORT, () => console.log(`Servidor en puerto ${PORT}`));


