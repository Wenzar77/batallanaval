// server/index.js — ESM
import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

import { PORT, DIST_DIR } from './constants.js';
import {
  getRoomByCode, onClientCloseCleanup, makeSpaHandler,
} from './rooms.js';
import { handleMessage } from './handlers.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const server = createServer(app);
const distPath = join(__dirname, DIST_DIR);

// Static
app.use(express.static(distPath));

const wss = new WebSocketServer({ server, path: '/ws' });

// Conexión WS
wss.on('connection', (ws) => {
  // Propiedades útiles en el socket
  ws.id = null;          // se asigna cuando crea/entra/resume
  ws.roomCode = null;    // code de sala cuando aplica
  ws.role = 'player';    // 'player' | 'viewer'

  ws.on('message', (raw) => {
    handleMessage(ws, raw);
  });

  ws.on('close', () => {
    const room = ws.roomCode ? getRoomByCode(ws.roomCode) : null;
    onClientCloseCleanup(ws, room);
  });
});

// Healthcheck
app.get('/health', (_req, res) => res.status(200).send('ok'));

// SPA fallback (excluye /ws)
app.get(/^\/(?!ws).*$/, makeSpaHandler(distPath));

server.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ HTTP+WS escuchando en 0.0.0.0:${PORT}  (WS en /ws)`);
});
