// =========================
// File: src/App.tsx
// =========================
import { useEffect, useMemo, useState } from 'react';
import {
  AppBar, Toolbar, Typography, Container, Paper, Box, Button, TextField, Chip,
  Stack, Snackbar, Alert, Divider, Badge, Avatar, Grid, Switch, FormControlLabel,
  LinearProgress
} from '@mui/material';

import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import RadarIcon from '@mui/icons-material/Radar';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import AddchartIcon from '@mui/icons-material/Addchart';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';
import TvIcon from '@mui/icons-material/Tv';

import ScoreScreen from './components/ScoreScreen';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import { EndGameModal } from './components/EndGameModal';

// ---- Tipos y constantes ----
type Team = 'A' | 'B';
const SIZE = 20;

// QS param keys
const QS_CODE = 'code';
const QS_TOKEN = 't';

// Utilidades de URL
const readQS = () => new URL(window.location.href).searchParams;
const setQS = (updates: Record<string, string | null | undefined>) => {
  const url = new URL(window.location.href);
  for (const [k, v] of Object.entries(updates)) {
    if (v === null || v === undefined || v === '') url.searchParams.delete(k);
    else url.searchParams.set(k, String(v));
  }
  window.history.replaceState({}, '', url.toString());
};
const ensureTokenInURL = (): string => {
  const url = new URL(window.location.href);
  let t = url.searchParams.get(QS_TOKEN);
  if (!t) {
    t = (crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2));
    url.searchParams.set(QS_TOKEN, t);
    window.history.replaceState({}, '', url.toString());
  }
  return t;
};

const buildScreenUrl = (roomCode: string): string => {
  // Asegura que exista token y devuélvelo
  const token = ensureTokenInURL();
  const base = `${window.location.origin}/screen`;
  const params = new URLSearchParams({ [QS_CODE]: roomCode, [QS_TOKEN]: token });
  return `${base}?${params.toString()}`;
};

// --- Flota estándar y nombres amigables ---
const FLEET_INFO = [
  { key: 'carrier', label: 'Portaviones', size: 5, count: 1, emoji: '🛳️' },
  { key: 'battleship', label: 'Acorazado', size: 4, count: 1, emoji: '🚢' },
  { key: 'cruiser', label: 'Crucero', size: 3, count: 2, emoji: '🛥️' },
  { key: 'destroyer', label: 'Destructor', size: 2, count: 3, emoji: '🚤' },
];
const FLEET_TOTAL_SHIPS = FLEET_INFO.reduce((s, f) => s + f.count, 0); // 7 barcos por equipo

type TeamBreakdown = { hits?: number; sinks?: number; trivia?: number };

type Snapshot = {
  code: string;
  state: 'lobby' | 'active' | `finished_A` | `finished_B`;
  turnTeam: Team;
  teamNames?: Record<Team, string>;
  players: { id: string; name: string; team: Team }[];
  weapons: Record<Team, string[]>;
  shipsRemaining: Record<Team, number>;
  gridSize: number;
  turnPlayerId?: string | null;
  history: { A: string[]; B: string[]; Amiss: string[]; Bmiss: string[] };
  scores?: {
    teams: Record<Team, number>;
    players: { id: string; name: string; team: Team; points: number }[];
    breakdown?: {
      teams: Record<Team, TeamBreakdown>;
    };
  };
  // Compatibilidad si tu server manda el breakdown fuera de scores:
  teamStats?: Record<Team, TeamBreakdown>;
  breakdown?: { teams?: Record<Team, TeamBreakdown> };
  stats?: { teams?: Record<Team, TeamBreakdown> };

  trivia?: {
    nonce: string;
    toTeam: Team;
    allowedPlayerId: string;
    timeout: number;
  } | null;
};

// Fallback de nombres e iconos (por si el server aún no los envía)
const DEFAULT_TEAM_NAMES: Record<Team, string> = { A: 'Jaguares', B: 'Guacamayas' };
const TEAM_ICONS: Record<Team, string> = { A: '🐆', B: '🦜' };

// Trivia message para el modal
type TriviaMsg = {
  card: { q: string; opts: string[] };
  nonce: string;
  canAnswer: boolean;
  playerName?: string;
  team?: Team;
};

// ---- Render de celda / tablero ----
function Cell({ state }: { state: 'unknown' | 'hit' | 'miss' | 'ship' }) {
  const bg =
    state === 'hit' ? '#d32f2f' :         // impacto (rojo)
      state === 'miss' ? '#90caf9' :        // fallo (azul claro)
        state === 'ship' ? '#c8e6c9' :        // barco propio (verde suave)
          '#e0e0e0';                            // desconocido
  return <Box sx={{ width: 22, height: 22, bgcolor: bg, border: '1px solid #fff' }} />;
}

function GridBoard({
  size, hits, misses, onClick, disabled, ownShips, showShips
}: {
  size: number;
  hits: Set<string>;
  misses: Set<string>;
  onClick?: (x: number, y: number) => void;
  disabled?: boolean;
  ownShips?: Set<string>;
  showShips?: boolean; // si true, muestra casillas de barcos propios
}) {
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: `repeat(${size}, 22px)`, gap: 0 }}>
      {Array.from({ length: size }).map((_, i) =>
        Array.from({ length: size }).map((_, j) => {
          const key = `${i},${j}`;
          const isHit = hits.has(key);
          const isMiss = misses.has(key);
          const isShip = !!ownShips?.has(key);

          const state: 'unknown' | 'hit' | 'miss' | 'ship' =
            isHit ? 'hit' :
              isMiss ? 'miss' :
                (showShips && isShip) ? 'ship' : 'unknown';

          return (
            <Box
              key={key}
              onClick={() => !disabled && onClick && onClick(i, j)}
              sx={{ cursor: disabled ? 'not-allowed' : 'pointer' }}
            >
              <Cell state={state} />
            </Box>
          );
        })
      )}
    </Box>
  );
}

// ---- Detección de pantalla de marcador ----
const isScreen = typeof window !== 'undefined' && window.location.pathname.endsWith('/screen');

/* ===============================
   Tip helpers para celdas de barcos (soluciona TS)
   =============================== */
type ShipCell = { x?: number; y?: number; i?: number; j?: number } | string;
// Normaliza "celda" a "i,j"
const toKey = (c: ShipCell) =>
  typeof c === 'string' ? c : `${c.x ?? c.i},${c.y ?? c.j}`;

// Lee celdas de barcos desde varias rutas posibles sin romper TS
function getTeamShipCells(snapshot: Snapshot, team: Team, clientId?: string): string[] {
  const s = snapshot as any; // encapsulamos flexibilidad aquí

  // RUTAS por cliente (privadas)
  const perClientCandidates: unknown[] = [
    clientId && s?.myFleetCells?.[clientId],                 // { [clientId]: ["3,5","3,6",...] }
    clientId && s?.playerBoards?.[clientId]?.shipCells,      // { [clientId]: { shipCells: [...] } }
    clientId && s?.clients?.[clientId]?.shipCells,           // { clients: { [clientId]: { shipCells } } }
  ].filter(Boolean);

  if (perClientCandidates.length > 0) {
    const flat: ShipCell[] = perClientCandidates.flatMap((v: any) => Array.isArray(v) ? v : [v]);
    return flat.map(toKey);
  }

  // RUTAS por equipo (asegúrate de que solo vayan a tus clientes)
  const perTeamCandidates: unknown[] = [
    s?.board?.[team]?.shipCells,                             // { board: { A: { shipCells } } }
    s?.fleetCells?.[team],                                   // { fleetCells: { A: [...] } }
    s?.ownFleet?.[team],                                     // { ownFleet: { A: [...] } }
    s?.fleet?.[team]?.cells,                                 // { fleet: { A: { cells:[{i,j}] } } }
    Array.isArray(s?.ships?.[team]) ? s.ships[team].flatMap((ship: any) => ship?.cells ?? []) : null,
    s?.teamFleet?.[team]?.cells,                             // { teamFleet: { A: { cells: [...] } } }
  ].filter(Boolean);

  if (perTeamCandidates.length === 0) return [];
  const flat: ShipCell[] = perTeamCandidates.flatMap((v: any) => Array.isArray(v) ? v : [v]);
  return flat.map(toKey);
}

/* ===============================
   Panel de Flota
   =============================== */
function FleetPanel({
  teamNames,
  shipsRemaining,
}: {
  teamNames: Record<Team, string>;
  shipsRemaining: Record<Team, number>;
}) {
  const remA = shipsRemaining.A;
  const remB = shipsRemaining.B;
  const sunkA = FLEET_TOTAL_SHIPS - remA; // hundidos al equipo A
  const sunkB = FLEET_TOTAL_SHIPS - remB; // hundidos al equipo B

  return (
    <>
      <Typography variant="h6" gutterBottom>
        Flota por equipo
      </Typography>

      {/* Equipo A */}
      <Stack spacing={0.5} sx={{ mb: 1.5 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Avatar sx={{ width: 24, height: 24, fontSize: 14 }}>{TEAM_ICONS.A}</Avatar>
          <Typography variant="subtitle2" sx={{ flexGrow: 1 }}>
            <b>{teamNames.A}</b> — Restantes: {remA}/{FLEET_TOTAL_SHIPS} · Hundidos: {sunkA}
          </Typography>
        </Stack>
        <LinearProgress variant="determinate" value={(remA / FLEET_TOTAL_SHIPS) * 100} />
      </Stack>

      {/* Equipo B */}
      <Stack spacing={0.5} sx={{ mb: 1.5 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Avatar sx={{ width: 24, height: 24, fontSize: 14 }}>{TEAM_ICONS.B}</Avatar>
          <Typography variant="subtitle2" sx={{ flexGrow: 1 }}>
            <b>{teamNames.B}</b> — Restantes: {remB}/{FLEET_TOTAL_SHIPS} · Hundidos: {sunkB}
          </Typography>
        </Stack>
        <LinearProgress variant="determinate" value={(remB / FLEET_TOTAL_SHIPS) * 100} />
      </Stack>

      <Divider sx={{ my: 1.5 }} />

      <Typography variant="subtitle2" gutterBottom>
        Composición de flota (por equipo)
      </Typography>
      <Stack direction="row" spacing={1} flexWrap="wrap">
        {FLEET_INFO.map((f) => (
          <Chip
            key={f.key}
            label={`${f.emoji} ${f.label} (${f.size}) ×${f.count}`}
            variant="outlined"
          />
        ))}
      </Stack>
    </>
  );
}

// ---- App principal ----
export default function App() {
  const initialQS = useMemo(() => readQS(), []);
  const initialCode = (initialQS.get(QS_CODE) ?? '').toUpperCase();
  const initialToken = initialQS.get(QS_TOKEN) ?? '';

  const [ws, setWs] = useState<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [code, setCode] = useState<string>(initialCode);
  const [clientId, setClientId] = useState<string>(initialToken);
  const [name, setName] = useState('');
  const [team, setTeam] = useState<Team>('A');
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [trivia, setTrivia] = useState<TriviaMsg | null>(null);
  const [weaponToUse, setWeaponToUse] = useState<string | null>(null);
  const [doubleShotPending, setDoubleShotPending] = useState<number>(0);
  const [mode, setMode] = useState<'crear' | 'unirme'>('crear');

  // Celdas privadas de MI flota, recibidas por WS (solo para este cliente)
  const [myFleetCells, setMyFleetCells] = useState<string[] | null>(null);

  let wasActive = false;
  const leaveGame = () => {
    if (!ws) return;
    ws.send(JSON.stringify({ type: 'leaveRoom' }));
    // Limpia estado local y URL para no reanudar automáticamente
    setSnapshot(null);
    setIsHost(false);
    setCode('');
    setMode('crear');
    setQS({ [QS_CODE]: null, [QS_TOKEN]: null }); // quitamos code y token de la URL
  };

  const handleTeamChange = (e: SelectChangeEvent) => {
    setTeam(e.target.value as Team);
  };

  const closeTrivia = () => setTrivia(null);

  const teamNames = snapshot?.teamNames ?? DEFAULT_TEAM_NAMES;
  const enemyTeam: Team = team === 'A' ? 'B' : 'A';

  const turnPlayer = snapshot?.turnPlayerId
    ? snapshot.players.find(p => p.id === snapshot.turnPlayerId)
    : undefined;
  const turnPlayerName = turnPlayer?.name ?? null;

  const turnPlayerNameFromSnapshot =
    snapshot?.turnPlayerId
      ? snapshot.players.find(p => p.id === snapshot.turnPlayerId)?.name ?? null
      : null;

  const safePlayerName = trivia?.playerName ?? turnPlayerNameFromSnapshot ?? 'el jugador en turno';
  const safeTeamKey = (trivia?.team ?? snapshot?.turnTeam ?? 'A') as Team;
  const names = snapshot?.teamNames ?? DEFAULT_TEAM_NAMES;
  const safeTeamName = names[safeTeamKey] ?? safeTeamKey;

  // ---- Conexión WS con reanudación por URL (sin storage) ----
  useEffect(() => {
    const wsUrl = (import.meta.env.VITE_WS_URL as string) || 'ws://localhost:3000/ws';
    let socket: WebSocket | null = null;
    let retry = 0;
    let closedByUs = false;
    let gotFirstSnapshot = false;

    const connect = () => {
      socket = new WebSocket(wsUrl);

      socket.onopen = () => {
        setWs(socket);
        setConnected(true);
        retry = 0;

        const qs = readQS();
        let urlCode = (qs.get(QS_CODE) ?? '').toUpperCase();
        let urlToken = qs.get(QS_TOKEN) ?? '';

        if (!urlCode && code) { urlCode = code; setQS({ [QS_CODE]: code }); }
        if (!urlToken) {
          urlToken = ensureTokenInURL();
          setClientId(urlToken);
        } else if (!clientId) {
          setClientId(urlToken);
        }

        if (urlCode && urlToken) {
          socket!.send(JSON.stringify({ type: 'resume', code: urlCode, clientId: urlToken }));
          // Fallback join si no llega snapshot pronto
          setTimeout(() => {
            if (!socket || socket.readyState !== 1) return;
            if (!gotFirstSnapshot) {
              socket.send(JSON.stringify({
                type: 'joinRoom',
                code: urlCode,
                name: name || 'Jugador',
                team,
                clientId: urlToken
              }));
            }
          }, 600);
        }

        // 🔁 Pide tus celdas un poco DESPUÉS del resume/join
        setTimeout(() => {
          try { socket?.send(JSON.stringify({ type: 'requestMyFleet' })); } catch { }
        }, 800); // ← subí de 300 a 800ms
      };

      socket.onmessage = (ev) => {
        const data = JSON.parse(ev.data);

        if (data.type === 'roomCreated') {
          const newCode: string = data.code;
          setCode(newCode);
          // asegura token y code en URL
          const token = clientId || ensureTokenInURL();
          if (!clientId) setClientId(token);
          setQS({ [QS_CODE]: newCode, [QS_TOKEN]: token });
        }

        if (data.type === 'roomUpdate') {
          gotFirstSnapshot = true;
          setSnapshot(data.snapshot);
          if (!data.snapshot.trivia) setTrivia(null);
        }

        if (data.type === 'toast') setToast(data.message);
        if (data.type === 'trivia') setTrivia(data);
        if (data.type === 'triviaEnd') setTrivia(null);

        if (data.type === 'left') {
          // ya saliste de la sala: limpia vista
          setSnapshot(null);
          setIsHost(false);
          setCode('');
          setMode('crear');
          setQS({ [QS_CODE]: null, [QS_TOKEN]: null });
        }

        if (data.type === 'myFleetCells' && Array.isArray(data.cells)) {
          // ej: { type: 'myFleetCells', cells: ["3,5","3,6", ...] }
          setMyFleetCells(data.cells);
        }

        if (data.type === 'playerBoard' && Array.isArray(data.shipCells)) {
          // ej: { type: 'playerBoard', shipCells: ["3,5","3,6", ...] }
          setMyFleetCells(data.shipCells);
        }

        // 🔁 Si acaba de pasar a active (tableros listos), pide tu flota
        const isActive = data.snapshot?.state === 'active';
        if (isActive && !wasActive) {
          wasActive = true;
          try { ws?.send(JSON.stringify({ type: 'requestMyFleet' })); } catch { }
        }

        // Si tu server manda evento explícito de final (opcional):
        if (data.type === 'gameOver' && data.payload?.scores) {
          // Aquí podrías procesar un breakdown alterno si viene en payload,
          // pero normalmente roomUpdate ya trae snapshot final.
        }
      };

      socket.onclose = () => {
        setConnected(false);
        setWs(null);
        if (!closedByUs) {
          const delay = Math.min(1000 * 2 ** retry, 8000);
          retry += 1;
          setTimeout(connect, delay);
        }
      };

      socket.onerror = () => {
        // deja que onclose maneje el backoff
      };
    };

    connect();

    return () => {
      closedByUs = true;
      try { socket?.close(); } catch { }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // una sola vez

  useEffect(() => {
    if (!trivia) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeTrivia(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [trivia]);

  // ---- Derivados de historia ----
  const hitsEnemy = useMemo(() => {
    if (!snapshot) return new Set<string>();
    const mine = team;
    return new Set(mine === 'A' ? snapshot.history.A : snapshot.history.B);
  }, [snapshot, team]);

  const missesEnemy = useMemo(() => {
    if (!snapshot) return new Set<string>();
    const mine = team;
    return new Set(mine === 'A' ? snapshot.history.Amiss : snapshot.history.Bmiss);
  }, [snapshot, team]);

  // Disparos del rival SOBRE MI tablero (defensa)
  const hitsMine = useMemo(() => {
    if (!snapshot) return new Set<string>();
    const mine = team; // mi equipo
    return new Set(mine === 'A' ? snapshot.history.B : snapshot.history.A);
  }, [snapshot, team]);

  const missesMine = useMemo(() => {
    if (!snapshot) return new Set<string>();
    const mine = team;
    return new Set(mine === 'A' ? snapshot.history.Bmiss : snapshot.history.Amiss);
  }, [snapshot, team]);

  // Tus barcos / celdas ocupadas por tu flota (busca por cliente y por equipo)
  const ownShips = useMemo(() => {
    // Prioridad 1: lo que llegó por WS de forma privada
    if (myFleetCells && myFleetCells.length > 0) {
      return new Set<string>(myFleetCells);
    }
    // Prioridad 2: intentar deducir desde snapshot
    if (!snapshot) return new Set<string>();
    return new Set<string>(getTeamShipCells(snapshot, team, clientId));
  }, [snapshot, team, clientId, myFleetCells]);



  const myTurn = !!(snapshot && snapshot.state === 'active' && snapshot.turnTeam === team);

  // ---- Acciones ----
  const createRoom = () => {
    if (!ws) return;
    setIsHost(true);
    const token = clientId || ensureTokenInURL();
    if (!clientId) setClientId(token);
    ws.send(JSON.stringify({ type: 'createRoom', name: name || 'Host', team, clientId: token }));
  };

  const joinRoom = () => {
    if (!ws || !code) return;
    setIsHost(false);
    const token = clientId || ensureTokenInURL();
    if (!clientId) setClientId(token);
    // asegura code y token en URL
    setQS({ [QS_CODE]: code, [QS_TOKEN]: token });
    ws.send(JSON.stringify({ type: 'joinRoom', code, name: name || 'Jugador', team, clientId: token }));
  };

  const startGame = () => ws && ws.send(JSON.stringify({ type: 'startGame' }));

  const fireAt = (i: number, j: number) => {
    if (!ws || !myTurn) return;
    const weapon = weaponToUse || undefined;
    ws.send(JSON.stringify({ type: 'fire', x: i, y: j, weapon }));
    if (weapon === 'doubleShot') {
      if (doubleShotPending === 0) setDoubleShotPending(1);
      else {
        setDoubleShotPending(0);
        setWeaponToUse(null);
      }
    } else {
      setWeaponToUse(null);
    }
  };

  const answerTrivia = (idx: number) => {
    if (!ws || !trivia) return;
    ws.send(JSON.stringify({ type: 'answerTrivia', nonce: trivia.nonce, answerIndex: idx }));
    setTrivia(null);
  };

  const myWeapons = snapshot?.weapons?.[team] || [];
  const weaponCounts = myWeapons.reduce<Record<string, number>>((acc, w) => {
    acc[w] = (acc[w] || 0) + 1;
    return acc;
  }, {});

  /* ===============================
     DERIVADOS PARA FIN DE JUEGO + BREAKDOWN
     =============================== */
  const gameOver = snapshot?.state === 'finished_A' || snapshot?.state === 'finished_B';

  const winnerTeamId: Team | null = (() => {
    if (!snapshot) return null;
    if (snapshot.state === 'finished_A') return 'A';
    if (snapshot.state === 'finished_B') return 'B';
    return null;
  })();

  // Obtiene breakdown por equipo desde múltiples posibles ubicaciones (compat).
  const teamBreakdown: Record<Team, TeamBreakdown> | undefined = useMemo(() => {
    if (!snapshot) return undefined;
    const fromScores = snapshot.scores?.breakdown?.teams;
    const fromRoot1 = snapshot.teamStats;
    const fromRoot2 = snapshot.breakdown?.teams;
    const fromRoot3 = snapshot.stats?.teams;
    return (fromScores || fromRoot1 || fromRoot2 || fromRoot3) as
      | Record<Team, TeamBreakdown>
      | undefined;
  }, [snapshot]);

  type LeaderboardRow = {
    teamId: Team | string;
    teamName: string;
    points: number;
    hits?: number;
    sinks?: number;
    trivia?: number;
  };

  const finalLeaderboard: LeaderboardRow[] = useMemo(() => {
    const tn = snapshot?.teamNames ?? DEFAULT_TEAM_NAMES;
    const teamScores = snapshot?.scores?.teams ?? { A: 0, B: 0 };

    const rowA: LeaderboardRow = {
      teamId: 'A',
      teamName: tn.A,
      points: teamScores.A ?? 0,
      ...(teamBreakdown?.A ?? {}),
    };
    const rowB: LeaderboardRow = {
      teamId: 'B',
      teamName: tn.B,
      points: teamScores.B ?? 0,
      ...(teamBreakdown?.B ?? {}),
    };

    return [rowA, rowB].sort((a, b) => b.points - a.points);
  }, [snapshot, teamBreakdown]);

  const handleRestart = () => {
    ws?.send(JSON.stringify({ type: 'restartGame' }));
  };

  const handleExit = () => {
    leaveGame();
  };

  // ---- Pantalla de marcador dedicada ----
  if (isScreen && snapshot) {
    return (
      <ScoreScreen
        snapshot={snapshot}
        teamNames={teamNames}
        teamIcons={TEAM_ICONS}
        activePlayerId={snapshot.turnPlayerId ?? null}
      />
    );
  }

  // ---- UI principal ----
  return (
    <>
      <AppBar position="sticky">
        <Toolbar>
          <Typography
            variant="h6"
            sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', gap: 1 }}
          >
            <Avatar sx={{ width: 28, height: 28, fontSize: 18 }}>{TEAM_ICONS.A}</Avatar>
            <b>{teamNames.A}</b>
            <span style={{ opacity: 0.7, margin: '0 6px' }}>vs</span>
            <Avatar sx={{ width: 28, height: 28, fontSize: 18 }}>{TEAM_ICONS.B}</Avatar>
            <b>{teamNames.B}</b>
          </Typography>

          <Chip
            color={connected ? 'success' : 'error'}
            label={connected ? 'WS conectado' : 'WS desconectado'}
            sx={{ mr: 1 }}
          />

          {/* Botón ver TABLERO */}
          <Button
            onClick={() => {
              const roomCode = snapshot?.code || code;   // usa el de la sala activa
              if (!roomCode) {
                setToast('No hay sala activa para abrir el tablero.');
                return;
              }
              const url = buildScreenUrl(roomCode);
              window.open(url, '_blank', 'noopener');
            }}
            variant="contained"
            startIcon={<TvIcon />}
            disabled={!snapshot?.code && !code}
            sx={{
              ml: 1,
              color: 'primary.main',
              bgcolor: 'white',
              fontWeight: 'bold',
              '&:hover': { bgcolor: 'grey.100' }
            }}
          >
            TABLERO
          </Button>

          {snapshot?.state === 'active' && (
            <Button
              onClick={leaveGame}
              color="error"
              variant="contained"
              startIcon={<PowerSettingsNewIcon />}
              sx={{ ml: 1, bgcolor: 'white', color: 'error.main', fontWeight: 'bold' }}
            >
              DESCONECTAR
            </Button>
          )}
        </Toolbar>
      </AppBar>

      <Container sx={{ mt: 3 }}>

        {/* Si el juego está activo, NO muestres los controles de lobby */}
        {snapshot?.state === 'active' ? (
          <Paper sx={{ p: 2, mb: 2 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
              <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                Sala <b>{snapshot.code}</b> • Jugando: <b>{teamNames.A}</b> vs <b>{teamNames.B}</b>
              </Typography>
              <Stack direction="row" spacing={1}>
                <Chip color="success" label="Partida en curso" />
              </Stack>
            </Stack>
          </Paper>
        ) : (
          <Paper sx={{ p: 2, mb: 2 }}>
            <Grid container spacing={3} alignItems="center">
              <Grid size={{ xs: 12, md: 3 }}>
                <TextField
                  fullWidth
                  label="Tu nombre"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </Grid>
            </Grid>

            <Grid container spacing={3} alignItems="center">
              <Grid size={{ xs: 12, md: 3 }}>
                <FormControl fullWidth>
                  <InputLabel id="team-label">Tu equipo</InputLabel>
                  <Select
                    labelId="team-label"
                    label="Tu equipo"
                    value={team}
                    onChange={handleTeamChange}
                  >
                    <MenuItem value="A">
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Avatar sx={{ width: 20, height: 20, fontSize: 14 }}>🐆</Avatar>
                        <span>{teamNames.A} (A)</span>
                      </Stack>
                    </MenuItem>
                    <MenuItem value="B">
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Avatar sx={{ width: 20, height: 20, fontSize: 14 }}>🦜</Avatar>
                        <span>{teamNames.B} (B)</span>
                      </Stack>
                    </MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Selector Crear/Unirme */}
              <Grid size={{ xs: 12, md: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={mode === 'unirme'}
                      onChange={(e) => setMode(e.target.checked ? 'unirme' : 'crear')}
                      color="primary"
                    />
                  }
                  label={mode === 'unirme' ? 'Unirme' : 'Crear sala'}
                />
              </Grid>

              {/* Zona de acciones dependiente del modo */}
              <Grid size={{ xs: 12, md: 7 }}>
                {mode === 'crear' ? (
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Button
                      variant="contained"
                      startIcon={<GroupAddIcon />}
                      onClick={createRoom}
                    >
                      Crear sala
                    </Button>

                    {/* Si ya hay código, muéstralo solo como lectura */}
                    {code && (
                      <TextField
                        size="small"
                        label="Código de sala"
                        value={code}
                        InputProps={{ readOnly: true }}
                        sx={{ width: 180 }}
                      />
                    )}

                    <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

                    <Button
                      variant="contained"
                      color="secondary"
                      startIcon={<PlayArrowIcon />}
                      onClick={startGame}
                      disabled={!isHost}
                    >
                      Iniciar
                    </Button>

                    <Button sx={{ visibility: 'hidden' }}
                      variant="outlined"
                      color="warning"
                      onClick={() => {
                        if (ws) {
                          ws.send(JSON.stringify({ type: 'changeTeam' }));
                        }
                      }}
                    >
                      Cambiar de equipo
                    </Button>
                  </Stack>
                ) : (
                  <Stack direction="row" spacing={1} alignItems="center">
                    <TextField
                      size="small"
                      label="Código"
                      value={code}
                      onChange={(e) => setCode(e.target.value.toUpperCase())}
                      sx={{ width: 160 }}
                    />
                    <Button variant="outlined" onClick={joinRoom}>
                      Unirme
                    </Button>
                  </Stack>
                )}
              </Grid>
            </Grid>
          </Paper>
        )}

        {snapshot && (
          <Grid container spacing={2}>
            {/* TABLERO DEL EQUIPO ENEMIGO */}
            <Grid size={{ xs: 12, md: 8 }}>
              <Paper
                sx={{
                  p: 2,
                  transition: 'all .25s ease',
                  ...(gameOver && {
                    filter: 'grayscale(0.4) blur(1px)',
                    opacity: 0.4,
                    pointerEvents: 'none',
                  })
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    Atacando a <b>{teamNames[enemyTeam]}</b>
                    <Avatar sx={{ width: 24, height: 24, fontSize: 14 }}>
                      {TEAM_ICONS[enemyTeam]}
                    </Avatar>
                  </Typography>

                  <Stack direction="row" spacing={1} alignItems="center">
                    <Chip
                      label={
                        snapshot.state === 'active'
                          ? ((snapshot.turnTeam === team) ? 'Tu turno' : 'Turno rival')
                          : snapshot.state
                      }
                      color={(snapshot.state === 'active' && snapshot.turnTeam === team) ? 'success' : 'default'}
                    />
                    <Chip
                      variant="outlined"
                      color="primary"
                      label={`Objetivo: ${teamNames[enemyTeam]} · ${snapshot.shipsRemaining[enemyTeam]}/${FLEET_TOTAL_SHIPS}`}
                    />
                  </Stack>
                </Stack>

                <Box sx={{ mt: 2, overflow: 'auto' }}>
                  <GridBoard
                    size={SIZE}
                    hits={hitsEnemy}
                    misses={missesEnemy}
                    onClick={fireAt}
                    disabled={!myTurn || gameOver}
                  />
                </Box>
              </Paper>

              {/* Tablero defensivo: cómo el enemigo destruye MIS barcos */}
              <Paper sx={{ p: 2, mt: 2 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    Mi flota ({teamNames[team]})
                    <Avatar sx={{ width: 24, height: 24, fontSize: 14 }}>
                      {TEAM_ICONS[team]}
                    </Avatar>
                  </Typography>

                  {/* Pequeña leyenda */}
                  <Stack direction="row" spacing={1}>
                    <Chip size="small" label="Barco" sx={{ bgcolor: '#c8e6c9' }} />
                    <Chip size="small" label="Impacto" sx={{ bgcolor: '#d32f2f', color: 'white' }} />
                    <Chip size="small" label="Fallo" sx={{ bgcolor: '#90caf9' }} />
                  </Stack>
                </Stack>


                <Box sx={{ mt: 2, overflow: 'auto' }}>
                  <GridBoard
                    size={SIZE}
                    hits={hitsMine}          // impactos del rival sobre mí
                    misses={missesMine}      // fallos del rival sobre mí
                    ownShips={ownShips}      // 👈 pinta mis barcos
                    showShips                // 👈 activa color de barco
                    disabled                 // tablero no clickeable
                  />
                </Box>
              </Paper>
            </Grid>

            {/* Panel derecha: info, armas, estado */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Paper
                sx={{
                  p: 2, mb: 2,
                  transition: 'all .25s ease',
                  ...(gameOver && { filter: 'grayscale(0.4)', opacity: 0.6, pointerEvents: 'none' })
                }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}
                >
                  Turno:
                  <Chip
                    size="small"
                    color="info"
                    avatar={<Avatar>{TEAM_ICONS[snapshot.turnTeam]}</Avatar>}
                    label={`${teamNames[snapshot.turnTeam]}${turnPlayerName ? ' · ' + turnPlayerName : ' · esperando jugador...'}`}
                  />
                </Typography>

                <Divider sx={{ my: 1.5 }} />

                <FleetPanel
                  teamNames={teamNames}
                  shipsRemaining={snapshot.shipsRemaining}
                />
              </Paper>

              <Paper
                sx={{
                  p: 2, mb: 2,
                  transition: 'all .25s ease',
                  ...(gameOver && { filter: 'grayscale(0.4)', opacity: 0.6, pointerEvents: 'none' })
                }}
              >
                <Typography variant="h6" gutterBottom>
                  Armas del equipo {team} ({teamNames[team]})
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {Object.entries(weaponCounts).length === 0 && <Chip label="Sin armas" />}

                  {Object.entries(weaponCounts).map(([w, count]) => (
                    <Chip
                      key={w}
                      clickable
                      color={weaponToUse === w ? 'success' : 'primary'}
                      onClick={() => setWeaponToUse(w)}
                      label={`${w} x${count}`}
                      icon={
                        w === 'radar' ? (
                          <RadarIcon />
                        ) : w === 'bomb3x3' ? (
                          <WhatshotIcon />
                        ) : w === 'crossMissile' ? (
                          <AddchartIcon />
                        ) : (
                          <HelpOutlineIcon />
                        )
                      }
                    />
                  ))}
                </Stack>
                {weaponToUse && (
                  <Alert sx={{ mt: 2 }} severity="info">
                    Arma seleccionada: <b>{weaponToUse}</b>. Da clic en el tablero para usarla.
                  </Alert>
                )}
              </Paper>

              <Paper
                sx={{
                  p: 2,
                  transition: 'all .25s ease',
                  ...(gameOver && { filter: 'grayscale(0.4)', opacity: 0.6 })
                }}
              >
                <Typography variant="h6" gutterBottom>
                  Jugadores
                </Typography>
                <Stack spacing={1}>
                  {snapshot.players.map((p) => {
                    const playerScore =
                      snapshot.scores?.players.find(sp => sp.id === p.id)?.points ?? 0;

                    return (
                      <Stack key={p.id} direction="row" alignItems="center" spacing={1}>
                        <Avatar sx={{ width: 28, height: 28, fontSize: 16 }}>
                          {TEAM_ICONS[p.team]}
                        </Avatar>
                        <Typography sx={{ flexGrow: 1 }}>{p.name}</Typography>
                        <Chip size="small" color="success" label={`${playerScore} pts`} />
                      </Stack>
                    );
                  })}
                </Stack>
              </Paper>
            </Grid>
          </Grid>
        )}
      </Container>

      {snapshot && (
        <Box sx={{ mt: 2 }}>
          <Alert
            severity="info"
            icon={false}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              fontSize: 16,
              '& .MuiAlert-message': { width: '100%' }
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1}>
              <Avatar sx={{ width: 26, height: 26, fontSize: 16 }}>
                {TEAM_ICONS[snapshot.turnTeam]}
              </Avatar>
              <b>{teamNames[snapshot.turnTeam]}</b>
              <span>•</span>
              <span>
                {turnPlayerName ? (
                  <>Turno de <b>{turnPlayerName}</b></>
                ) : (
                  <>Esperando jugador del equipo</>
                )}
              </span>
            </Stack>
          </Alert>
        </Box>
      )}

      {/* Trivia Dialog */}
      {trivia && (
        <Box
          sx={{
            position: 'fixed',
            inset: 0,
            bgcolor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 2,
            zIndex: 9999
          }}
          onClick={closeTrivia}
        >
          <Paper
            onClick={(e) => e.stopPropagation()}
            sx={{ p: 3, maxWidth: 600, width: '100%', position: 'relative' }}
            elevation={6}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="h6">Pregunta sorpresa</Typography>
              <IconButton aria-label="Cerrar" onClick={closeTrivia} size="small">
                <CloseIcon />
              </IconButton>
            </Box>

            <Alert severity={trivia.canAnswer ? 'success' : 'warning'} sx={{ mb: 2 }}>
              {trivia.canAnswer
                ? '¡Te toca responder!'
                : `Responde ${trivia.playerName ?? 'jugador en turno'} — ${teamNames[(trivia as any).team as 'A' | 'B'] ?? ''}`}
            </Alert>

            <Typography sx={{ mb: 2 }}>{trivia.card.q}</Typography>

            <Stack spacing={1}>
              {trivia.card.opts.map((opt, idx) => (
                <Button
                  key={idx}
                  variant="outlined"
                  onClick={() => trivia.canAnswer && answerTrivia(idx)}
                  disabled={!trivia.canAnswer}
                >
                  {opt}
                </Button>
              ))}
            </Stack>

            <Stack direction="row" justifyContent="flex-end" spacing={1} sx={{ mt: 2 }}>
              <Button onClick={closeTrivia}>Cerrar</Button>
            </Stack>
          </Paper>
        </Box>
      )}

      {/* Snackbar / Toast */}
      <Snackbar open={!!toast} autoHideDuration={3000} onClose={() => setToast(null)}>
        {trivia ? (
          <Alert severity={trivia.canAnswer ? 'success' : 'warning'} sx={{ mb: 2 }}>
            {trivia.canAnswer
              ? '¡Te toca responder!'
              : <>Responde <b>{safePlayerName}</b> — <b>{safeTeamName}</b></>}
          </Alert>
        ) : (
          <Alert onClose={() => setToast(null)} severity="info" sx={{ width: '100%' }}>
            {toast}
          </Alert>
        )}
      </Snackbar>

      {/* ===== MODAL DE FIN DE JUEGO ===== */}
      <EndGameModal
        open={!!gameOver}
        winnerTeamId={winnerTeamId}
        leaderboard={finalLeaderboard}
        onRestart={handleRestart}
        onExit={handleExit}
        title="¡Partida terminada!"
      />
    </>
  );
}
