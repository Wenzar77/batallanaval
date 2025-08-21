// =========================
// File: src/App.tsx
// =========================
import { useEffect, useMemo, useState } from 'react';
import {
  AppBar, Toolbar, Typography, Container, Paper, Box, Button, TextField, Chip,
  Stack, Snackbar, Alert, Divider, Badge, Avatar
} from '@mui/material';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import RadarIcon from '@mui/icons-material/Radar';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import AddchartIcon from '@mui/icons-material/Addchart';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import Grid from '@mui/material/GridLegacy';
// arriba de App.tsx
import ScoreScreen from './components/ScoreScreen';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';




// ---- Tipos y constantes ----
type Team = 'A' | 'B';
const SIZE = 20;

type Snapshot = {
  code: string;
  state: 'lobby' | 'active' | `finished_A` | `finished_B`;
  turnTeam: Team;
  teamNames?: Record<Team, string>;
  players: { id: string; name: string; team: Team }[];
  weapons: Record<Team, string[]>;
  shipsRemaining: Record<Team, number>;
  gridSize: number;
  turnPlayerId?: string | null;   // 👈 NEW
  history: { A: string[]; B: string[]; Amiss: string[]; Bmiss: string[] };
  scores?: {
    teams: Record<Team, number>;
    players: { id: string; name: string; team: Team; points: number }[];
  };
};

// Fallback de nombres e iconos (por si el server aún no los envía)
const DEFAULT_TEAM_NAMES: Record<Team, string> = { A: 'Jaguares', B: 'Guacamayas' };
const TEAM_ICONS: Record<Team, string> = { A: '🐆', B: '🦜' };

// Trivia message
type TriviaMsg = {
  card: { q: string; opts: string[] };
  nonce: string;
  canAnswer: boolean;
  playerName?: string;  // opcional
  team?: Team;          // opcional
};


// ---- Render de celda / tablero ----
function Cell({ state }: { state: 'unknown' | 'hit' | 'miss' }) {
  const bg = state === 'hit' ? '#d32f2f' : state === 'miss' ? '#90caf9' : '#e0e0e0';
  return <Box sx={{ width: 22, height: 22, bgcolor: bg, border: '1px solid #fff' }} />;
}

function GridBoard({
  size, hits, misses, onClick, disabled
}: {
  size: number;
  hits: Set<string>;
  misses: Set<string>;
  onClick?: (x: number, y: number) => void;
  disabled?: boolean;
}) {
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: `repeat(${size}, 22px)`, gap: 0 }}>
      {Array.from({ length: size }).map((_, i) =>
        Array.from({ length: size }).map((_, j) => {
          const key = `${i},${j}`;
          const state: 'unknown' | 'hit' | 'miss' =
            hits.has(key) ? 'hit' : misses.has(key) ? 'miss' : 'unknown';
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



// ---- App principal ----
export default function App() {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [team, setTeam] = useState<Team>('A');
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [trivia, setTrivia] = useState<TriviaMsg | null>(null);
  const [weaponToUse, setWeaponToUse] = useState<string | null>(null);
  const [doubleShotPending, setDoubleShotPending] = useState<number>(0);

  const handleTeamChange = (e: SelectChangeEvent) => {
    setTeam(e.target.value as Team);
  };

  const closeTrivia = () => setTrivia(null);

  // justo después de:
  const teamNames = snapshot?.teamNames ?? DEFAULT_TEAM_NAMES;
  const enemyTeam: Team = team === 'A' ? 'B' : 'A';

  const turnPlayer = snapshot?.turnPlayerId
    ? snapshot.players.find(p => p.id === snapshot.turnPlayerId)
    : undefined;
  const turnPlayerName = turnPlayer?.name ?? null;

  // nombre del jugador en turno según snapshot (por si trivia no trae playerName)
  const turnPlayerNameFromSnapshot =
    snapshot?.turnPlayerId
      ? snapshot.players.find(p => p.id === snapshot.turnPlayerId)?.name ?? null
      : null;

  // fallbacks robustos
  const safePlayerName = trivia?.playerName ?? turnPlayerNameFromSnapshot ?? 'el jugador en turno';
  const safeTeamKey = (trivia?.team ?? snapshot?.turnTeam ?? 'A') as Team;
  const names = snapshot?.teamNames ?? DEFAULT_TEAM_NAMES;
  const safeTeamName = names[safeTeamKey] ?? safeTeamKey;

  // ---- Conexión WS ----
  useEffect(() => {
    const wsUrl = (import.meta.env.VITE_WS_URL as string) || 'ws://localhost:3000/ws';
    console.log('WS URL ->', wsUrl);

    const socket = new WebSocket(wsUrl);
    socket.onopen = () => setConnected(true);
    socket.onclose = () => setConnected(false);
    socket.onmessage = (ev) => {
      const data = JSON.parse(ev.data);
      if (data.type === 'roomCreated') setCode(data.code);
      if (data.type === 'roomUpdate') {
        setSnapshot(data.snapshot);

        // 👇 Si el servidor dice que NO hay trivia, asegúrate de cerrar el modal
        if (!data.snapshot.trivia) {
          setTrivia(null);
        } else {
          // (opcional) si hay trivia activa y el nonce cambió, reemplaza
          setTrivia((curr) => {
            const s = data.snapshot.trivia;
            if (!curr || curr.nonce !== s.nonce) return curr; // o puedes decidir sincronizar
            return curr; // deja igual si coincide
          });
        }
      }

      if (data.type === 'toast') setToast(data.message);
      if (data.type === 'trivia') { console.log('[TRIVIA RX]', data); setTrivia(data); }
      if (data.type === 'triviaEnd') {
        //setTrivia((curr) => (curr && curr.nonce === data.nonce ? null : curr));        
        setTrivia(null);
      }
    };

    setWs(socket);
    return () => socket.close();
  }, []);

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

  const myTurn = !!(snapshot && snapshot.state === 'active' && snapshot.turnTeam === team);

  // ---- Acciones ----
  const createRoom = () => {
    if (!ws) return;
    setIsHost(true);
    ws.send(JSON.stringify({ type: 'createRoom', name: name || 'Host', team }));
  };

  const joinRoom = () => {
    if (!ws || !code) return;
    setIsHost(false);
    ws.send(JSON.stringify({ type: 'joinRoom', code, name: name || 'Jugador', team }));
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


  // ---- Pantalla de marcador dedicada ----
  if (isScreen && snapshot) {
    return (
      <ScoreScreen
        snapshot={snapshot}
        teamNames={teamNames}
        teamIcons={TEAM_ICONS}
        activePlayerId={snapshot.turnPlayerId ?? null} // 👈 clave
      />
    );
  }

  // ---- UI principal ----
  return (
    <>
      <AppBar position="sticky">
        <Toolbar>
          <SportsEsportsIcon sx={{ mr: 1 }} />
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
          <Button onClick={() => window.open('/screen', '_blank')} variant="outlined">
            Abrir Pantalla
          </Button>
        </Toolbar>
      </AppBar>

      <Container sx={{ mt: 3 }}>
        <Paper sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Tu nombre"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={3}>
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

            <Grid item xs={12} md={7}>
              <Stack direction="row" spacing={1}>
                <Button variant="contained" startIcon={<GroupAddIcon />} onClick={createRoom}>
                  Crear sala
                </Button>
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
                <Button
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
            </Grid>
          </Grid>
        </Paper>

        {snapshot && (
          <Grid container spacing={2}>
            {/* Panel izquierda: tablero enemigo */}
            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 2 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    Atacando a <b>{teamNames[enemyTeam]}</b>
                    <Avatar sx={{ width: 24, height: 24, fontSize: 14 }}>
                      {TEAM_ICONS[enemyTeam]}
                    </Avatar>
                  </Typography>
                  <Chip
                    label={
                      snapshot.state === 'active'
                        ? myTurn
                          ? 'Tu turno'
                          : 'Turno rival'
                        : snapshot.state
                    }
                    color={myTurn ? 'success' : 'default'}
                  />
                </Stack>
                <Box sx={{ mt: 2, overflow: 'auto' }}>
                  <GridBoard
                    size={SIZE}
                    hits={hitsEnemy}
                    misses={missesEnemy}
                    onClick={fireAt}
                    disabled={!myTurn}
                  />
                </Box>
              </Paper>
            </Grid>

            {/* Panel derecha: info, armas, estado */}
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2, mb: 2 }}>
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

                <Typography variant="subtitle1" sx={{ mt: 1 }}>
                  Barcos restantes — A: {snapshot.shipsRemaining.A} | B: {snapshot.shipsRemaining.B}
                </Typography>
              </Paper>

              <Paper sx={{ p: 2, mb: 2 }}>
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
                      label={`${w} x${count}`}   // 👈 muestra cantidad
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

              <Paper sx={{ p: 2 }}>
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
                        <Badge
                          color={p.team === 'A' ? 'primary' : 'secondary'}
                          badgeContent={p.team}
                        >
                          <Box sx={{ pl: 1, pr: 1 }} />
                        </Badge>
                        <Typography sx={{ flexGrow: 1 }}>{p.name}</Typography>
                        <Chip
                          size="small"
                          color="success"
                          label={`${playerScore} pts`}
                        />
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
          // clic en el fondo cierra
          onClick={closeTrivia}
        >
          <Paper
            onClick={(e) => e.stopPropagation()} // no cerrar si se hace clic dentro
            sx={{ p: 3, maxWidth: 600, width: '100%', position: 'relative' }}
            elevation={6}
          >
            {/* header con botón X */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="h6">Pregunta sorpresa</Typography>
              <IconButton aria-label="Cerrar" onClick={closeTrivia} size="small">
                <CloseIcon />
              </IconButton>
            </Box>

            {/* Indica claramente quién debe responder */}
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

            {/* acciones abajo: Cerrar siempre disponible */}
            <Stack direction="row" justifyContent="flex-end" spacing={1} sx={{ mt: 2 }}>
              <Button onClick={closeTrivia}>Cerrar</Button>
            </Stack>
          </Paper>
        </Box>
      )}



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

    </>
  );
}
