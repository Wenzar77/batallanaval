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
type TriviaMsg = { card: { q: string; opts: string[] }; nonce: string };

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

  // Nombres seguros e iconos
  const teamNames = snapshot?.teamNames ?? DEFAULT_TEAM_NAMES;
  const enemyTeam: Team = team === 'A' ? 'B' : 'A';

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
      if (data.type === 'roomUpdate') setSnapshot(data.snapshot);
      if (data.type === 'toast') setToast(data.message);
      if (data.type === 'trivia') setTrivia(data);
    };

    setWs(socket);
    return () => socket.close();
  }, []);

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

  // ---- Pantalla de marcador dedicada ----
  if (isScreen && snapshot) {
    return <ScoreScreen snapshot={snapshot} teamNames={teamNames} teamIcons={TEAM_ICONS} />;
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
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                label="Equipo (A/B)"
                value={team}
                onChange={(e) =>
                  setTeam((e.target.value.toUpperCase() === 'B' ? 'B' : 'A') as Team)
                }
              />
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
                <Typography variant="subtitle1">
                  Sala: <b>{snapshot.code}</b>
                </Typography>

                <Typography
                  variant="subtitle1"
                  sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}
                >
                  Turno:
                  <Chip
                    size="small"
                    color="info"
                    avatar={<Avatar>{TEAM_ICONS[snapshot.turnTeam]}</Avatar>}
                    label={`${snapshot.turnTeam} — ${teamNames[snapshot.turnTeam]}`}
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
                  {myWeapons.length === 0 && <Chip label="Sin armas" />}
                  {myWeapons.map((w, idx) => (
                    <Chip
                      key={idx}
                      clickable
                      color={weaponToUse === w ? 'success' : 'primary'}
                      onClick={() => setWeaponToUse(w)}
                      label={w}
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
                  {snapshot.players.map((p) => (
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
                      <Typography>{p.name}</Typography>
                    </Stack>
                  ))}
                </Stack>
              </Paper>
            </Grid>
          </Grid>
        )}
      </Container>

      {/* Trivia Dialog */}
      {trivia && (
        <Paper
          sx={{
            position: 'fixed',
            inset: 0,
            bgcolor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 2
          }}
        >
          <Paper sx={{ p: 3, maxWidth: 600 }}>
            <Typography variant="h6" gutterBottom>
              Pregunta sorpresa
            </Typography>
            <Typography sx={{ mb: 2 }}>{trivia.card.q}</Typography>
            <Stack spacing={1}>
              {trivia.card.opts.map((opt, idx) => (
                <Button key={idx} variant="outlined" onClick={() => answerTrivia(idx)}>
                  {opt}
                </Button>
              ))}
            </Stack>
            <Alert sx={{ mt: 2 }} severity="info">
              Responde rápido para desbloquear un arma especial
            </Alert>
          </Paper>
        </Paper>
      )}

      <Snackbar open={!!toast} autoHideDuration={3000} onClose={() => setToast(null)}>
        <Alert severity="success" onClose={() => setToast(null)}>
          {toast}
        </Alert>
      </Snackbar>
    </>
  );
}
