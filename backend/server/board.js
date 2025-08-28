// server/board.js
import { SIZE, SHIPS } from './constants.js';

export function emptyBoard() {
  return Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
}

export function placeShipsRandomly() {
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

/**
 * Helper genérico para cuadrados:
 * - size impar: centrado en (x,y)  ⇒ p.ej. 3x3 como tu bomb3x3
 * - size par:   (x,y) es esquina superior izquierda ⇒ p.ej. 2x2
 * Siempre recorta a los límites del tablero.
 */
export function coordsInSquare(x, y, size) {
  const c = [];
  if (size % 2 === 1) {
    const half = Math.floor(size / 2);
    for (let i = x - half; i <= x + half; i++) {
      for (let j = y - half; j <= y + half; j++) {
        if (i >= 0 && i < SIZE && j >= 0 && j < SIZE) c.push([i, j]);
      }
    }
  } else {
    for (let i = x; i < x + size; i++) {
      for (let j = y; j < y + size; j++) {
        if (i >= 0 && i < SIZE && j >= 0 && j < SIZE) c.push([i, j]);
      }
    }
  }
  return c;
}

// 3x3 centrado en (x,y) — conserva tu comportamiento actual
export function coordsInBomb3x3(x, y) {
  return coordsInSquare(x, y, 3);
}

// NUEVA: 2x2 con (x,y) como esquina superior izquierda
export function coordsInBomb2x2(x, y) {
  return coordsInSquare(x, y, 2);
}

export function coordsInCross(x, y) {
  const c = [];
  for (let i = 0; i < SIZE; i++) c.push([i, y]);
  for (let j = 0; j < SIZE; j++) if (j !== y) c.push([x, j]);
  return c;
}

export function countShipsRemaining(board, enemyHitsSet) {
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

export function isShipSunk(board, shipId, enemyHitsSet) {
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

// Serializa celdas de barcos como ["i,j", ...]
export function shipCellsStrings(board) {
  if (!board) return [];
  const cells = [];
  for (let i = 0; i < SIZE; i++) {
    for (let j = 0; j < SIZE; j++) if (board[i][j] > 0) cells.push(`${i},${j}`);
  }
  return cells;
}