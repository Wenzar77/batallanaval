// server/handlers.js
import { TRIVIA_BANK } from './data/trivia.js';
import {
  getRoomsMap, getRoomByCode, saveRoom, deleteRoom,
  makeSnapshot, broadcast, sendMyFleet
} from './rooms.js';
import {
  uuid, randomChoice, generateCode
} from './utils.js';
import {
  SIZE, TRIVIA_PROB, TRIVIA_TIME, WEAPONS,
  PTS_HIT, PTS_SINK, PTS_TRIVIA
} from './constants.js';
import {
  placeShipsRandomly, coordsInBomb3x3, coordsInCross, isShipSunk, countShipsRemaining, coordsInBomb2x2
} from './board.js';


// === Trivia deck helpers (no repetir hasta agotar) ===
function buildTriviaDeck() {
  // baraja índices 0..N-1
  return Array
    .from({ length: TRIVIA_BANK.length }, (_, i) => i)
    .sort(() => Math.random() - 0.5);
}

/** Toma la siguiente carta de trivia; si el mazo está vacío, lo reinicia */
function drawTriviaCard(room) {
  if (!Array.isArray(room.triviaDeck) || room.triviaDeck.length === 0) {
    room.triviaDeck = buildTriviaDeck();
  }
  const idx = room.triviaDeck.shift();   // saca el primero
  const card = TRIVIA_BANK[idx];
  return { card, idx };
}


export function handleMessage(ws, raw) {
  let data; try { data = JSON.parse(raw); } catch { return; }
  const type = data.type;

  // -------- Cambiar equipo (debug / admin) --------
  if (type === 'changeTeam') {
    const room = getRoomByCode(ws.roomCode);
    if (!room) return;
    const player = room.players.get(ws.id);
    if (!player) return;

    player.team = player.team === 'A' ? 'B' : 'A';
    sendMyFleet(ws, room);
    broadcast(room, { type: 'roomUpdate', snapshot: makeSnapshot(room) });
    return;
  }

  // -------- Crear sala --------
  if (type === 'createRoom') {
    const rooms = getRoomsMap();
    const playerId = data.clientId || uuid();
    const code = generateCode(rooms, 5);

    const room = {
      code,
      state: 'lobby',
      players: new Map(),
      clients: new Set(),
      viewers: new Set(), // 👈 soporta pantallas /screen
      boards: { A: null, B: null },
      hits: { A: new Set(), B: new Set() },
      misses: { A: new Set(), B: new Set() },
      weapons: { A: [], B: [] },
      turnTeam: Math.random() < 0.5 ? 'A' : 'B',
      turnPlayerId: null,
      triviaPending: null,
      scores: { teams: { A: 0, B: 0 }, players: new Map() },
      sunk: { A: new Set(), B: new Set() },      
      triviaDeck: buildTriviaDeck(),
    };
    saveRoom(room);

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

    ws.id = playerId;

    try { ws.send(JSON.stringify({ type: 'roomCreated', code })); } catch { }
    broadcast(room, { type: 'roomUpdate', snapshot: makeSnapshot(room) });
    return;
  }

  // -------- Unirse a sala --------
  if (type === 'joinRoom') {
    const room = getRoomByCode(data.code);
    if (!room) { try { ws.send(JSON.stringify({ type: 'error', message: 'Sala no existe' })); } catch { } return; }

    const playerId = data.clientId || uuid();
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

    sendMyFleet(ws, room);
    broadcast(room, { type: 'roomUpdate', snapshot: makeSnapshot(room) });
    return;
  }

  // -------- Reanudar --------
  if (type === 'resume') {
    const { code, clientId } = data;
    const room = getRoomByCode(code);
    if (!room) { try { ws.send(JSON.stringify({ type: 'toast', message: 'Sala no existe' })); } catch { } return; }

    ws.id = clientId;
    ws.roomCode = code;

    const player = room.players.get(clientId);
    if (!player) {
      try { ws.send(JSON.stringify({ type: 'toast', message: 'No hay jugador para reanudar' })); } catch { }
      return;
    }

    room.clients.add(ws);
    player.disconnectedAt = null;

    try { ws.send(JSON.stringify({ type: 'resumed' })); } catch { }
    sendMyFleet(ws, room);
    broadcast(room, { type: 'roomUpdate', snapshot: makeSnapshot(room) });
    return;
  }

  // -------- Ver sala (viewer /screen) --------
  if (type === 'watchRoom') {
    const room = getRoomByCode(data.code);
    if (!room) { try { ws.send(JSON.stringify({ type: 'error', message: 'Sala no encontrada' })); } catch { } return; }

    ws.role = 'viewer';
    ws.roomCode = room.code;
    room.viewers.add(ws);

    try { ws.send(JSON.stringify({ type: 'roomUpdate', snapshot: makeSnapshot(room) })); } catch { }
    try { ws.send(JSON.stringify({ type: 'toast', message: `👀 Viendo sala ${room.code}` })); } catch { }
    return;
  }

  // -------- Solicitud de flota privada --------
  if (type === 'requestMyFleet') {
    const room = getRoomByCode(ws.roomCode);
    if (!room) return;
    sendMyFleet(ws, room);
    return;
  }

  // -------- Iniciar juego --------
  if (type === 'startGame') {
    const room = getRoomByCode(ws.roomCode); if (!room) return;
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

    room.triviaDeck = buildTriviaDeck();

    // Enviar celdas privadas a cada jugador
    for (const client of room.clients) { try { sendMyFleet(client, room); } catch { } }

    broadcast(room, { type: 'roomUpdate', snapshot: makeSnapshot(room) });
    return;
  }

  // -------- Disparo --------
  if (type === 'fire') {
    const room = getRoomByCode(ws.roomCode); if (!room || room.state !== 'active') return;
    const shooter = room.players.get(ws.id); if (!shooter) return;
    const team = shooter.team;
    if (team !== room.turnTeam) { try { ws.send(JSON.stringify({ type: 'error', message: 'No es tu turno' })); } catch { } return; }

    const { x, y, weapon } = data;

    // Validar arma si viene especificada: debe existir en inventario del equipo
    if (weapon) {
      const idx = room.weapons[team].indexOf(weapon);
      if (idx === -1) {
        try { ws.send(JSON.stringify({ type: 'toast', message: '❌ No tienes ese arma disponible' })); } catch { }
        return;
      }
    }

    // Calcular objetivos
    let targets = [[x, y]];
    if (weapon === 'bomb3x3') targets = coordsInBomb3x3(x, y);
    else if (weapon === 'crossMissile') targets = coordsInCross(x, y);
    else if (weapon === 'bomb2x2') targets = coordsInBomb2x2(x, y);

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

    // Consumir arma si se usó
    if (weapon) {
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
      const { card } = drawTriviaCard(room);
      const nonce = uuid();

      room.triviaPending = {
        toTeam: team,
        allowedPlayerId: shooter.id,
        nonce,
        answer: card.a,
        timeout: Date.now() + TRIVIA_TIME
      };

      // Jugadores
      for (const client of room.clients) {
        try {
          if (client.readyState !== 1) continue;
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
      // Viewers (solo informativo)
      if (room.viewers && room.viewers.size) {
        const viewerPayload = {
          type: 'trivia',
          card: { q: card.q, opts: card.opts },
          nonce,
          canAnswer: false,
          playerName: shooter.name,
          team: team,
          allowedPlayerId: shooter.id
        };
        for (const viewer of room.viewers) { try { viewer.send(JSON.stringify(viewerPayload)); } catch { } }
      }

      setTimeout(() => {
        if (room.triviaPending && room.triviaPending.nonce === nonce) {
          room.triviaPending = null;
          broadcast(room, { type: 'triviaEnd', nonce, reason: 'timeout' });
          broadcast(room, { type: 'roomUpdate', snapshot: makeSnapshot(room) });
        }
      }, TRIVIA_TIME + 1000);
    }

    broadcast(room, { type: 'roomUpdate', snapshot: makeSnapshot(room) });
    return;
  }

  // -------- Responder trivia --------
  if (type === 'answerTrivia') {
    const room = getRoomByCode(ws.roomCode); if (!room || !room.triviaPending) return;
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

  // -------- Salir de la sala --------
  if (type === 'leaveRoom') {
    const room = getRoomByCode(ws.roomCode);
    if (!room) { try { ws.send(JSON.stringify({ type: 'left' })); } catch { } return; }

    room.clients.delete(ws);

    // Elimina jugador y puntaje
    const pid = ws.id;
    room.players.delete(pid);
    room.scores?.players?.delete(pid);

    ws.roomCode = null;

    try { ws.send(JSON.stringify({ type: 'left' })); } catch { }
    broadcast(room, { type: 'roomUpdate', snapshot: makeSnapshot(room) });

    if (room.players.size === 0 && room.clients.size === 0 && (!room.viewers || room.viewers.size === 0)) {
      deleteRoom(room.code);
    }
    return;
  }
}
