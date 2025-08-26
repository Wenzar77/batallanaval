// server/utils.js
import crypto from 'crypto';
import { CODE_ALPHABET } from './constants.js';

export const uuid = () => crypto.randomUUID();

export const randomChoice = (arr) => arr[Math.floor(Math.random() * arr.length)];

export function generateCode(roomsMap, length = 5) {
  let code = '';
  do {
    code = '';
    for (let i = 0; i < length; i++) {
      const idx = crypto.randomInt(0, CODE_ALPHABET.length);
      code += CODE_ALPHABET[idx];
    }
  } while (roomsMap.has(code));
  return code;
}
