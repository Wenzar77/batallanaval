// server/constants.js
export const PORT = process.env.PORT || 3000;
export const SIZE = 20;
export const SHIPS = [5, 4, 3, 3, 2, 2, 2];
export const TRIVIA_PROB = 0.35;
export const TRIVIA_TIME = 15_000;
export const WEAPONS = ['doubleShot', 'bomb3x3', 'crossMissile', 'radar'];
export const TEAM_NAMES = { A: 'Jaguares', B: 'Guacamayas' };
export const DIST_DIR = '../dist'; // relativo a server/index.js

// Puntos
export const PTS_HIT = 10;
export const PTS_SINK = 30;
export const PTS_TRIVIA = 15;

export const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // sin I/O/0/1
