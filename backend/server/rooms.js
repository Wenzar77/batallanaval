// server/rooms.js
import { TEAM_NAMES, SIZE, PTS_HIT, PTS_SINK, PTS_TRIVIA } from './constants.js';
import { shipCellsStrings, countShipsRemaining } from './board.js';

// ===== Estado en memoria =====
/*
room = {
  code, state, players(Map), clients(Set), viewers(Set), boards,
  hits, misses, weapons, turnTeam, turnPlayerId, triviaPending,
  scores: { teams:{A,B}, players: Map<playerId, points> },
  sunk: { A: Set<shipId>, B: Set<shipId> }
}
*/
const rooms = new Map();

// API Rooms
export const getRoomsMap = () => rooms;
export const getRoomByCode = (code) => rooms.get(code);
export const saveRoom = (room) => rooms.set(room.code, room);
export const deleteRoom = (code) => rooms.delete(code);

// Snapshot
export function makeSnapshot(room) {
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

// Broadcast a jugadores y viewers
export const broadcast = (room, payload) => {
  const data = JSON.stringify(payload);
  for (const client of room.clients) { try { client.send(data); } catch {} }
  if (room.viewers) for (const viewer of room.viewers) { try { viewer.send(data); } catch {} }
};

// Envía celdas privadas SOLO al dueño
export function sendMyFleet(ws, room) {
  try {
    const player = room.players.get(ws.id);
    if (!player) return;
    if (!room.boards?.A || !room.boards?.B) return; // aún no hay tableros
    const team = player.team;
    const board = team === 'A' ? room.boards.A : room.boards.B;
    const cells = shipCellsStrings(board);
    ws.send(JSON.stringify({ type: 'myFleetCells', cells }));
  } catch {}
}

// Limpieza post-cierre
export function onClientCloseCleanup(ws, room) {
  if (!room) return;

  room.clients.delete(ws);
  if (room.viewers) room.viewers.delete(ws);

  // Permitir reanudar si era jugador
  const player = room.players.get(ws.id);
  if (player) {
    player.disconnectedAt = Date.now();
  }

  broadcast(room, { type: 'roomUpdate', snapshot: makeSnapshot(room) });

  // Limpieza diferida a los 10 minutos para jugadores
  setTimeout(() => {
    const still = getRoomByCode(ws.roomCode);
    if (!still) return;
    const p = still.players.get(ws.id);
    if (p && p.disconnectedAt && Date.now() - p.disconnectedAt > 10 * 60 * 1000) {
      still.players.delete(ws.id);
      still.scores?.players?.delete(ws.id);
      broadcast(still, { type: 'roomUpdate', snapshot: makeSnapshot(still) });
    }

    // Eliminar sala si está vacía (sin jugadores, sin clientes, sin viewers)
    if (still.players.size === 0 && still.clients.size === 0 && (!still.viewers || still.viewers.size === 0)) {
      deleteRoom(still.code);
    }
  }, 10 * 60 * 1000);
}

// SPA handler
export const makeSpaHandler = (distPath) => (_req, res) => {
  res.sendFile(joinPath(distPath, 'index.html'));
};

// Node path join helper (no top-level import para mantener este archivo puro lógica de salas)
import { join as joinPath } from 'path';
