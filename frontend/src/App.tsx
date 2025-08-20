// =========================
// File: src/App.tsx
// =========================
import { useEffect, useMemo, useState } from 'react'
import { AppBar, Toolbar, Typography, Container, Paper, Box, Button, TextField, Chip, Stack, Snackbar, Alert, Divider, Badge } from '@mui/material'
import SportsEsportsIcon from '@mui/icons-material/SportsEsports'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import GroupAddIcon from '@mui/icons-material/GroupAdd'
import RadarIcon from '@mui/icons-material/Radar'
import WhatshotIcon from '@mui/icons-material/Whatshot'
import AddchartIcon from '@mui/icons-material/Addchart'
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'
import Grid from '@mui/material/GridLegacy';

// Tipos
type Team = 'A' | 'B'
const SIZE = 20

type Snapshot = {
  code: string
  state: 'lobby' | 'active' | `finished_A` | `finished_B`
  turnTeam: Team
  teamNames: Record<Team, string>              // <-- nuevo
  players: { id: string; name: string; team: Team }[]
  weapons: Record<Team, string[]>
  shipsRemaining: Record<Team, number>
  gridSize: number
  history: { A: string[]; B: string[]; Amiss: string[]; Bmiss: string[] }
  scores: {
    teams: Record<Team, number>
    players: { id: string; name: string; team: Team; points: number }[]
  }
}


// Trivia message
type TriviaMsg = { card: { q: string; opts: string[] }; nonce: string }

// Render celda
function Cell({ state }: { state: 'unknown' | 'hit' | 'miss' }) {
  const bg = state === 'hit' ? '#d32f2f' : state === 'miss' ? '#90caf9' : '#e0e0e0'
  return <Box sx={{ width: 22, height: 22, bgcolor: bg, border: '1px solid #fff' }} />
}

function GridBoard({ size, hits, misses, onClick, disabled }: { size: number; hits: Set<string>; misses: Set<string>; onClick?: (x: number, y: number) => void; disabled?: boolean }) {
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: `repeat(${size}, 22px)`, gap: 0 }}>
      {Array.from({ length: size }).map((_, i) =>
        Array.from({ length: size }).map((_, j) => {
          const key = `${i},${j}`
          const state: 'unknown' | 'hit' | 'miss' = hits.has(key) ? 'hit' : misses.has(key) ? 'miss' : 'unknown'
          return <Box key={key} onClick={() => !disabled && onClick && onClick(i, j)} sx={{ cursor: disabled ? 'not-allowed' : 'pointer' }}>
            <Cell state={state} />
          </Box>
        })
      )}
    </Box>
  )
}

const isScreen = typeof window !== 'undefined' && window.location.pathname.endsWith('/screen');


function ScoreScreen({ snapshot }: { snapshot: Snapshot }) {
  const totalTeamA = snapshot.scores.teams.A || 0;
  const totalTeamB = snapshot.scores.teams.B || 0;
  const maxTeam = Math.max(1, totalTeamA, totalTeamB);

  const playersSorted = [...snapshot.scores.players].sort((a, b) => b.points - a.points);

  return (
    <Box sx={{ p: 3, bgcolor: '#0b1020', minHeight: '100vh', color: '#fff' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h4">Sala {snapshot.code}</Typography>
        <Chip
          color="info"
          label={snapshot.state === 'active'
            ? `Turno: ${snapshot.turnTeam === 'A' ? snapshot.teamNames.A : snapshot.teamNames.B}`
            : snapshot.state.startsWith('finished_')
              ? `Ganó ${snapshot.state.endsWith('A') ? snapshot.teamNames.A : snapshot.teamNames.B}`
              : 'En lobby'}
          sx={{ fontSize: 18, p: 2 }}
        />
      </Stack>

      <Grid container spacing={3}>
        {/* Marcador por equipos */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, bgcolor: '#111732' }}>
            <Typography variant="h5" gutterBottom>{snapshot.teamNames.A} (A)</Typography>
            <Typography variant="h3" sx={{ mb: 1 }}>{totalTeamA} pts</Typography>
            <Box sx={{ bgcolor: '#263055', height: 18, borderRadius: 1 }}>
              <Box sx={{ width: `${(totalTeamA / maxTeam) * 100}%`, height: 18, bgcolor: '#42a5f5', borderRadius: 1 }} />
            </Box>
            <Typography sx={{ mt: 2 }}>Barcos restantes: {snapshot.shipsRemaining.A}</Typography>
            <Typography>Armas: {snapshot.weapons.A.length ? snapshot.weapons.A.join(', ') : '—'}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, bgcolor: '#111732' }}>
            <Typography variant="h5" gutterBottom>{snapshot.teamNames.B} (B)</Typography>
            <Typography variant="h3" sx={{ mb: 1 }}>{totalTeamB} pts</Typography>
            <Box sx={{ bgcolor: '#263055', height: 18, borderRadius: 1 }}>
              <Box sx={{ width: `${(totalTeamB / maxTeam) * 100}%`, height: 18, bgcolor: '#66bb6a', borderRadius: 1 }} />
            </Box>
            <Typography sx={{ mt: 2 }}>Barcos restantes: {snapshot.shipsRemaining.B}</Typography>
            <Typography>Armas: {snapshot.weapons.B.length ? snapshot.weapons.B.join(', ') : '—'}</Typography>
          </Paper>
        </Grid>

        {/* Tabla de jugadores */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, bgcolor: '#111732' }}>
            <Typography variant="h5" gutterBottom>Jugadores</Typography>
            <Grid container spacing={2}>
              {playersSorted.map((p, idx) => (
                <Grid key={p.id} item xs={12} md={6} lg={4}>
                  <Paper sx={{ p: 2, bgcolor: '#17204a', display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Chip
                      label={idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : idx + 1}
                      color={p.team === 'A' ? 'primary' : 'success'}
                    />
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography sx={{ fontWeight: 700 }}>{p.name}</Typography>
                      <Typography variant="body2" sx={{ opacity: 0.8 }}>
                        {p.team === 'A' ? snapshot.teamNames.A : snapshot.teamNames.B}
                      </Typography>
                    </Box>
                    <Typography variant="h6">{p.points} pts</Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      <Typography sx={{ mt: 3, opacity: 0.75 }}>
        Reglas de puntuación: Acierto +10 · Hundimiento +30 · Trivia correcta +15
      </Typography>
    </Box>
  );
}


export default function App() {
  const [ws, setWs] = useState<WebSocket | null>(null)
  const [connected, setConnected] = useState(false)
  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [team, setTeam] = useState<Team>('A')
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null)
  const [isHost, setIsHost] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [trivia, setTrivia] = useState<TriviaMsg | null>(null)
  const [weaponToUse, setWeaponToUse] = useState<string | null>(null)
  const [doubleShotPending, setDoubleShotPending] = useState<number>(0)

  useEffect(() => {

    const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:3000/ws';
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


  const hitsEnemy = useMemo(() => {
    if (!snapshot) return new Set<string>()
    const mine = team
    return new Set(mine === 'A' ? snapshot.history.A : snapshot.history.B)
  }, [snapshot, team])

  const missesEnemy = useMemo(() => {
    if (!snapshot) return new Set<string>()
    const mine = team
    return new Set(mine === 'A' ? snapshot.history.Amiss : snapshot.history.Bmiss)
  }, [snapshot, team])

  const myTurn = snapshot && snapshot.state === 'active' && snapshot.turnTeam === team

  const createRoom = () => {
    if (!ws) return
    setIsHost(true)
    ws.send(JSON.stringify({ type: 'createRoom', name: name || 'Host', team }))
  }

  const joinRoom = () => {
    if (!ws || !code) return
    setIsHost(false)
    ws.send(JSON.stringify({ type: 'joinRoom', code, name: name || 'Jugador', team }))
  }

  const startGame = () => ws && ws.send(JSON.stringify({ type: 'startGame' }))

  const fireAt = (i: number, j: number) => {
    if (!ws || !myTurn) return
    const weapon = weaponToUse || undefined
    ws.send(JSON.stringify({ type: 'fire', x: i, y: j, weapon }))
    if (weapon === 'doubleShot') {
      // Permite un segundo disparo: reducimos contador; si era 0, consumimos arma
      if (doubleShotPending === 0) setDoubleShotPending(1)
      else {
        // segunda bala consumida
        setDoubleShotPending(0)
        setWeaponToUse(null)
      }
    } else {
      setWeaponToUse(null)
    }
  }

  const answerTrivia = (idx: number) => {
    if (!ws || !trivia) return
    ws.send(JSON.stringify({ type: 'answerTrivia', nonce: trivia.nonce, answerIndex: idx }))
    setTrivia(null)
  }

  const myWeapons = snapshot?.weapons?.[team] || []

  if (isScreen && snapshot) {
    return <ScoreScreen snapshot={snapshot} />;
  } else {

    return (
      <>
        <Button onClick={() => window.open('/screen', '_blank')} variant="outlined">
          Abrir Pantalla
        </Button>
        <AppBar position="sticky">
          <Button onClick={() => window.open('/screen', '_blank')} variant="outlined">
            Abrir Pantalla
          </Button>

          <Toolbar>
            <SportsEsportsIcon sx={{ mr: 1 }} />
            <Typography variant="h6" sx={{ flexGrow: 1 }}>Batalla Naval 20x20 + Trivia</Typography>
            <Chip color={connected ? 'success' : 'error'} label={connected ? 'WS conectado' : 'WS desconectado'} />
          </Toolbar>
        </AppBar>

        <Container sx={{ mt: 3 }}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={3}>
                <TextField fullWidth label="Tu nombre" value={name} onChange={e => setName(e.target.value)} />
              </Grid>
              <Grid item xs={12} md={2}>
                <TextField fullWidth label="Equipo (A/B)" value={team} onChange={e => setTeam((e.target.value.toUpperCase() === 'B' ? 'B' : 'A') as Team)} />
              </Grid>
              <Grid item xs={12} md={7}>
                <Stack direction="row" spacing={1}>
                  <Button variant="contained" startIcon={<GroupAddIcon />} onClick={createRoom}>Crear sala</Button>
                  <TextField size="small" label="Código" value={code} onChange={e => setCode(e.target.value.toUpperCase())} sx={{ width: 160 }} />
                  <Button variant="outlined" onClick={joinRoom}>Unirme</Button>
                  <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
                  <Button variant="contained" color="secondary" startIcon={<PlayArrowIcon />} onClick={startGame} disabled={!isHost}>Iniciar</Button>
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
                    <Typography variant="h6">Tablero enemigo (equipo {team === 'A' ? 'B' : 'A'})</Typography>
                    <Chip label={snapshot.state === 'active' ? (myTurn ? 'Tu turno' : 'Turno rival') : snapshot.state} color={myTurn ? 'success' : 'default'} />
                  </Stack>
                  <Box sx={{ mt: 2, overflow: 'auto' }}>
                    <GridBoard size={SIZE} hits={hitsEnemy} misses={missesEnemy} onClick={fireAt} disabled={!myTurn} />
                  </Box>
                </Paper>
              </Grid>

              {/* Panel derecha: info, armas, estado */}
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 2, mb: 2 }}>
                  <Typography variant="subtitle1">Sala: <b>{snapshot.code}</b></Typography>
                  <Typography variant="subtitle1">Turno: <Chip size="small" label={snapshot.turnTeam} /></Typography>
                  <Typography variant="subtitle1">Barcos restantes — A: {snapshot.shipsRemaining.A} | B: {snapshot.shipsRemaining.B}</Typography>
                </Paper>

                <Paper sx={{ p: 2, mb: 2 }}>
                  <Typography variant="h6" gutterBottom>Armas del equipo {team}</Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    {myWeapons.length === 0 && <Chip label="Sin armas" />}
                    {myWeapons.map((w, idx) => (
                      <Chip key={idx} clickable color={weaponToUse === w ? 'success' : 'primary'} onClick={() => setWeaponToUse(w)} label={w} icon={w === 'radar' ? <RadarIcon /> : w === 'bomb3x3' ? <WhatshotIcon /> : w === 'crossMissile' ? <AddchartIcon /> : <HelpOutlineIcon />} />
                    ))}
                  </Stack>
                  {weaponToUse && <Alert sx={{ mt: 2 }} severity="info">Arma seleccionada: <b>{weaponToUse}</b>. Da clic en el tablero para usarla.</Alert>}
                </Paper>

                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>Jugadores</Typography>
                  <Stack spacing={1}>
                    {snapshot.players.map(p => (
                      <Stack key={p.id} direction="row" alignItems="center" spacing={1}>
                        <Badge color={p.team === 'A' ? 'primary' : 'secondary'} badgeContent={p.team} />
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
          <Paper sx={{ position: 'fixed', inset: 0, bgcolor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
            <Paper sx={{ p: 3, maxWidth: 600 }}>
              <Typography variant="h6" gutterBottom>Pregunta sorpresa</Typography>
              <Typography sx={{ mb: 2 }}>{trivia.card.q}</Typography>
              <Stack spacing={1}>
                {trivia.card.opts.map((opt, idx) => (
                  <Button key={idx} variant="outlined" onClick={() => answerTrivia(idx)}>{opt}</Button>
                ))}
              </Stack>
              <Alert sx={{ mt: 2 }} severity="info">Responde rápido para desbloquear un arma especial</Alert>
            </Paper>
          </Paper>
        )}

        <Snackbar open={!!toast} autoHideDuration={3000} onClose={() => setToast(null)}>
          <Alert severity="success" onClose={() => setToast(null)}>{toast}</Alert>
        </Snackbar>
      </>
    )
  }
}