import { useEffect, useMemo, useState, useRef } from 'react';
import {
  Container, Stack, Typography, Chip, Divider, Snackbar, Alert, Box,
  Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Grid
} from '@mui/material';
import HeaderBar from './components/HeaderBar';
import Lobby from './components/Lobby';
import SectionCard from './components/SectionCard';
import GridBoard from './components/Board';
import FleetPanel from './components/FleetPanel';
import WeaponsPanel from './components/WeaponsPanel';
import PlayersList from './components/PlayersList';
import TriviaDialog from './components/TriviaDialog';
import TurnAlert from './components/TurnAlert';
import ScoreScreen from './components/ScoreScreen';
import { EndGameModal } from './components/EndGameModal';
import { useResponsiveBoard } from './hooks/useResponsive';
import { SIZE, DEFAULT_TEAM_NAMES, TEAM_ICONS, getTeamShipCells, FLEET_TOTAL_SHIPS } from './utils/fleet';
import { ensureTokenInURL, readQS, setQS, QS_CODE, QS_TOKEN } from './utils/url';
import type { Snapshot, Team, TriviaMsg, TeamBreakdown } from './types/game';

const isScreen = typeof window !== 'undefined' && window.location.pathname.endsWith('/screen');

export default function App() {
  const { cellSize, boardScrollMaxW } = useResponsiveBoard();

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

  type PendingShot = { x: number; y: number; weapon?: string | null; nonce?: string };
  const [pendingShot, setPendingShot] = useState<PendingShot | null>(null);

  const [weaponToUse, setWeaponToUse] = useState<string | null>(null);
  const [doubleShotPending, setDoubleShotPending] = useState<number>(0);
  const [mode, setMode] = useState<'crear' | 'unirme'>('crear');
  const [myFleetCells, setMyFleetCells] = useState<string[] | null>(null);

  // Diálogo para "Ver tablero"
  const [askCodeOpen, setAskCodeOpen] = useState(false);
  const [inputCode, setInputCode] = useState<string>('');

  const wasActiveRef = useRef(false);

  const leaveGame = () => {
    if (!ws) return;
    ws.send(JSON.stringify({ type: 'leaveRoom' }));
    setSnapshot(null); setIsHost(false); setCode(''); setMode('crear');
    setQS({ [QS_CODE]: null, [QS_TOKEN]: null });
  };

  const teamNames = snapshot?.teamNames ?? DEFAULT_TEAM_NAMES;
  const enemyTeam: Team = team === 'A' ? 'B' : 'A';


  // Jugador en turno (cálculo robusto) 
  const activeId = useMemo(() => { if (!snapshot?.turnPlayerId) return null; return String(snapshot.turnPlayerId); }, [snapshot?.turnPlayerId]);
  // Buscar al jugador activo de forma robusta (id o clientId)
  const activePlayer = useMemo(() => {
    if (!snapshot || !activeId) return null;
    return (
      snapshot.players.find(p => String(p.id) === activeId) ||
      (snapshot.players as any).find?.((p: any) => p.clientId && String(p.clientId) === activeId) ||
      null
    );
  }, [snapshot, activeId]);


  const activeTeam = snapshot?.turnTeam ?? null;
  const activePlayerName =
    snapshot?.players.find(p => String(p.id) === String(snapshot.turnPlayerId))?.name
    ?? (snapshot as any)?.turnPlayerName
    ?? null;

  const turnPlayer = activePlayer ?? (snapshot?.turnPlayerId ? snapshot.players.find(p => p.id === snapshot.turnPlayerId) : undefined) ?? undefined;
  const turnPlayerName = activePlayerName ?? turnPlayer?.name ?? null;

  const actuallyFire = (i: number, j: number, weapon?: string | null) => {
    if (!ws || !myTurn) return;
    ws.send(JSON.stringify({ type: 'fire', x: i, y: j, weapon: weapon || undefined }));

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

  const fireAt = (i: number, j: number) => {
    if (!ws || !myTurn) return;
    const weapon = weaponToUse || undefined;

    // Si hay trivia y me toca responder, NO dispares aún:
    if (trivia && trivia.canAnswer) {
      setPendingShot({ x: i, y: j, weapon, nonce: (trivia as any).nonce });
      setToast('Primero responde la trivia para poder disparar.');
      return;
    }

    actuallyFire(i, j, weapon);
  };

  // Conexión WS
  useEffect(() => {
    const wsUrl = (import.meta.env.VITE_WS_URL as string) || 'ws://localhost:3000/ws';
    let socket: WebSocket | null = null; let retry = 0; let closedByUs = false; let gotFirstSnapshot = false;

    const connect = () => {
      socket = new WebSocket(wsUrl);

      socket.onopen = () => {
        setWs(socket);
        setConnected(true);
        retry = 0;

        // Tokens / QS
        const qs = readQS();
        let urlCode = (qs.get(QS_CODE) ?? '').toUpperCase();
        let urlToken = qs.get(QS_TOKEN) ?? '';

        if (!urlCode && code) { urlCode = code; setQS({ [QS_CODE]: code }); }
        if (!urlToken) { urlToken = ensureTokenInURL(); setClientId(urlToken); } else if (!clientId) { setClientId(urlToken); }

        // Reanudar si ya había código y token
        if (urlCode && urlToken) {
          socket!.send(JSON.stringify({ type: 'resume', code: urlCode, clientId: urlToken }));
          setTimeout(() => {
            if (!socket || socket.readyState !== 1) return;
            if (!gotFirstSnapshot) {
              socket.send(JSON.stringify({ type: 'joinRoom', code: urlCode, name: name || 'Jugador', team, clientId: urlToken }));
            }
          }, 600);
        }

        // Pide mi flota (si aplica)
        setTimeout(() => { try { socket?.send(JSON.stringify({ type: 'requestMyFleet' })); } catch { } }, 800);

        // Modo pantalla (/screen): observar
        if (isScreen) {
          const qs2 = new URL(window.location.href).searchParams;
          const urlCode2 = (qs2.get('code') ?? '').toUpperCase();
          if (urlCode2) {
            socket!.send(JSON.stringify({ type: 'watchRoom', code: urlCode2 }));
          }
        }
      };

      socket.onmessage = (ev) => {
        const data = JSON.parse(ev.data);

        if (data.type === 'roomCreated') {
          const newCode: string = data.code; setCode(newCode);
          const token = clientId || ensureTokenInURL(); if (!clientId) setClientId(token);
          setQS({ [QS_CODE]: newCode, [QS_TOKEN]: token });
        }

        if (data.type === 'roomUpdate') {
          gotFirstSnapshot = true;
          setSnapshot(data.snapshot);
          if (!data.snapshot.trivia) setTrivia(null);
        }

        if (data.type === 'toast') setToast(data.message);

        if (data.type === 'trivia') {
          setTrivia(data);
          // Si llega una trivia nueva con otro nonce, descarta un tiro pendiente anterior
          if (pendingShot && pendingShot.nonce && pendingShot.nonce !== data.nonce) {
            setPendingShot(null);
          }
        }

        if (data.type === 'triviaEnd') {
          // Detectar acierto posible
          const correct =
            (typeof data.correct === 'boolean' ? data.correct : undefined) ??
            (data.winnerClientId ? data.winnerClientId === clientId : undefined) ??
            false;

          // Si tengo un tiro pendiente y coincide (si hay nonce), decide
          if (pendingShot && (!data.nonce || !pendingShot.nonce || data.nonce === pendingShot.nonce)) {
            if (correct) {
              actuallyFire(pendingShot.x, pendingShot.y, pendingShot.weapon);
            } else {
              setToast('Respuesta incorrecta. Se cancela el disparo.');
            }
            setPendingShot(null);
          }

          setTrivia(null);
        }

        if (data.type === 'left') {
          setSnapshot(null); setIsHost(false); setCode(''); setMode('crear');
          setQS({ [QS_CODE]: null, [QS_TOKEN]: null });
        }

        if (data.type === 'myFleetCells' && Array.isArray(data.cells)) setMyFleetCells(data.cells);
        if (data.type === 'playerBoard' && Array.isArray(data.shipCells)) setMyFleetCells(data.shipCells);

        const active = data.snapshot?.state === 'active';
        if (active && !wasActiveRef.current) {
          wasActiveRef.current = true;
          try { ws?.send(JSON.stringify({ type: 'requestMyFleet' })); } catch { }
        }
      };

      socket.onclose = () => {
        setConnected(false); setWs(null);
        if (!closedByUs) {
          const delay = Math.min(1000 * 2 ** retry, 8000);
          retry += 1;
          setTimeout(connect, delay);
        }
      };

      socket.onerror = () => { /* noop */ };
    };

    connect();
    return () => { closedByUs = true; try { socket?.close(); } catch { } };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!trivia) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setTrivia(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [trivia]);

  const hitsEnemy = useMemo(() => (!snapshot ? new Set<string>() : new Set(team === 'A' ? snapshot.history.A : snapshot.history.B)), [snapshot, team]);
  const missesEnemy = useMemo(() => (!snapshot ? new Set<string>() : new Set(team === 'A' ? snapshot.history.Amiss : snapshot.history.Bmiss)), [snapshot, team]);
  const hitsMine = useMemo(() => (!snapshot ? new Set<string>() : new Set(team === 'A' ? snapshot.history.B : snapshot.history.A)), [snapshot, team]);
  const missesMine = useMemo(() => (!snapshot ? new Set<string>() : new Set(team === 'A' ? snapshot.history.Bmiss : snapshot.history.Amiss)), [snapshot, team]);
  const ownShips = useMemo(() => (myFleetCells?.length ? new Set(myFleetCells) : new Set(!snapshot ? [] : getTeamShipCells(snapshot, team, clientId))), [snapshot, team, clientId, myFleetCells]);
  const myTurn = !!(snapshot && snapshot.state === 'active' && snapshot.turnTeam === team);

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
    setQS({ [QS_CODE]: code, [QS_TOKEN]: token });
    ws.send(JSON.stringify({ type: 'joinRoom', code, name: name || 'Jugador', team, clientId: token }));
  };

  const startGame = () => {
    if (!ws) return;

    // Si aún no hay snapshot, deja que el server valide
    if (!snapshot) {
      ws.send(JSON.stringify({ type: 'startGame' }));
      return;
    }

    const countA = snapshot.players?.filter(p => p.team === 'A').length ?? 0;
    const countB = snapshot.players?.filter(p => p.team === 'B').length ?? 0;

    if (countA < 1 || countB < 1) {
      const msg =
        countA < 1 && countB < 1
          ? 'No puedes iniciar: Jaguares y Guacamayas no tienen jugadores.'
          : countA < 1
            ? 'No puedes iniciar: Jaguares no tiene jugadores.'
            : 'No puedes iniciar: Guacamayas no tiene jugadores.';
      setToast(msg);
      return;
    }

    ws.send(JSON.stringify({ type: 'startGame' }));
  };

  const answerTrivia = (idx: number) => {
    if (!ws || !trivia) return;
    ws.send(JSON.stringify({ type: 'answerTrivia', nonce: trivia.nonce, answerIndex: idx }));
    setTrivia(null);
  };

  const myWeapons = snapshot?.weapons?.[team] || [];
  const weaponCounts = myWeapons.reduce<Record<string, number>>((acc, w) => { acc[w] = (acc[w] || 0) + 1; return acc; }, {});

  const gameOver = snapshot?.state === 'finished_A' || snapshot?.state === 'finished_B';
  const winnerTeamId: Team | null = !snapshot ? null : snapshot.state === 'finished_A' ? 'A' : snapshot.state === 'finished_B' ? 'B' : null;

  const teamBreakdown: Record<Team, TeamBreakdown> | undefined = useMemo(() => {
    if (!snapshot) return undefined;
    return (snapshot.scores?.breakdown?.teams || snapshot.teamStats || snapshot.breakdown?.teams || snapshot.stats?.teams) as Record<Team, TeamBreakdown> | undefined;
  }, [snapshot]);

  type LeaderboardRow = { teamId: Team | string; teamName: string; points: number; hits?: number; sinks?: number; trivia?: number; };
  const finalLeaderboard: LeaderboardRow[] = useMemo(() => {
    const tn = snapshot?.teamNames ?? DEFAULT_TEAM_NAMES; const teamScores = snapshot?.scores?.teams ?? { A: 0, B: 0 };
    return ([
      { teamId: 'A', teamName: tn.A, points: teamScores.A ?? 0, ...(teamBreakdown?.A ?? {}) },
      { teamId: 'B', teamName: tn.B, points: teamScores.B ?? 0, ...(teamBreakdown?.B ?? {}) },
    ]).sort((a, b) => b.points - a.points);
  }, [snapshot, teamBreakdown]);

  // Handlers del botón "Ver tablero"
  const openWatchDialog = () => {
    setInputCode(code || '');
    setAskCodeOpen(true);
  };

  const confirmWatch = () => {
    const room = (inputCode || '').toUpperCase().trim();
    if (!room || !ws) { setAskCodeOpen(false); return; }
    setCode(room);
    setQS({ [QS_CODE]: room }); // guardamos en URL
    ws.send(JSON.stringify({ type: 'watchRoom', code: room }));
    setAskCodeOpen(false);
  };

  if (isScreen && snapshot) {
    return (
      <ScoreScreen
        snapshot={snapshot}
        teamNames={teamNames}
        teamIcons={TEAM_ICONS}
        activePlayerId={activeId}
      />
    );
  }

  return (
    <Box sx={{
      width: "100vw",
      height: "100vh",
      backgroundImage: "url('/bg-ocean.png')",
      backgroundSize: "cover",
      backgroundColor: "#87ceeb",
      backgroundPosition: "center",
    }}
    >
      <HeaderBar
        snapshot={snapshot}
        teamNames={teamNames}
        code={code}
        connected={connected}
        onLeave={leaveGame}
        setToast={setToast}
        onWatch={openWatchDialog}
      />

      <Container sx={{ mt: 3, pb: 3 }} >
        {snapshot?.state === 'active' ? (
          <SectionCard compact>
            <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between" spacing={1.5}>
              <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                Sala <b>{snapshot.code}</b> • Jugando: <b>{teamNames.A}</b> vs <b>{teamNames.B}</b>
              </Typography>
              <Stack direction="row" spacing={1}><Chip color="success" size="small" label="Partida en curso" /></Stack>
            </Stack>
          </SectionCard>
        ) : (
          <SectionCard compact>
            <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between" spacing={1.5}>
              <Typography variant="subtitle1">Lobby</Typography>
            </Stack>

            <Box mt={1.5}>
              <Lobby
                name={name} setName={setName}
                team={team} setTeam={setTeam}
                mode={mode} setMode={setMode}
                code={code} setCode={setCode}
                teamNames={teamNames}
                isHost={isHost}
                onCreate={createRoom}
                onStart={startGame}
                onJoin={joinRoom}
              />
            </Box>
          </SectionCard>
        )}

        {snapshot && (
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 8 }}>
              <SectionCard disabledStyling={gameOver} compact>
                <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={1}>
                  <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                    Atacando a <b>{teamNames[enemyTeam]}</b>
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                    <Chip
                      label={snapshot.state === 'active' ? ((snapshot.turnTeam === team) ? 'Tu turno' : 'Turno rival') : snapshot.state}
                      color={(snapshot.state === 'active' && snapshot.turnTeam === team) ? 'success' : 'default'}
                      size="small"
                    />
                    <Chip variant="outlined" color="primary" size="small" label={`Objetivo: ${teamNames[enemyTeam]} · ${snapshot.shipsRemaining[enemyTeam]}/${FLEET_TOTAL_SHIPS}`} />
                  </Stack>
                </Stack>
                <Box sx={{ mt: 2, overflowX: 'auto', overflowY: 'hidden', WebkitOverflowScrolling: 'touch', maxWidth: boardScrollMaxW, pb: 1 }}>
                  <GridBoard
                    size={SIZE}
                    hits={hitsEnemy}
                    misses={missesEnemy}
                    onClick={fireAt}
                    disabled={!myTurn || gameOver || !!pendingShot}
                    cellSize={cellSize}
                  />
                </Box>
              </SectionCard>

              <SectionCard compact>
                <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={1}>
                  <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                    Mi flota ({teamNames[team]})
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    <Chip size="small" label="Barco" sx={{ bgcolor: '#c8e6c9' }} />
                    <Chip size="small" label="Impacto" sx={{ bgcolor: '#d32f2f', color: 'white' }} />
                    <Chip size="small" label="Fallo" sx={{ bgcolor: '#90caf9' }} />
                  </Stack>
                </Stack>
                <Box sx={{ mt: 2, overflowX: 'auto', overflowY: 'hidden', WebkitOverflowScrolling: 'touch', maxWidth: boardScrollMaxW, pb: 1 }}>
                  <GridBoard size={SIZE} hits={hitsMine} misses={missesMine} ownShips={ownShips} showShips disabled cellSize={cellSize} />
                </Box>
              </SectionCard>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <SectionCard disabledStyling={gameOver} compact>
                <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                  Turno:
                  <Chip size="small" color="info" label={`${teamNames[snapshot.turnTeam]}${turnPlayerName ? ' · ' + turnPlayerName : ' · esperando...'}`} />
                </Typography>
                <Divider sx={{ my: 1.5 }} />
                <FleetPanel teamNames={teamNames} shipsRemaining={snapshot.shipsRemaining} />
              </SectionCard>

              <SectionCard disabledStyling={gameOver} compact>
                <Typography variant="h6" gutterBottom>Armas del equipo {teamNames[team]}</Typography>
                <WeaponsPanel weaponCounts={weaponCounts} weaponToUse={weaponToUse} setWeaponToUse={setWeaponToUse} />
              </SectionCard>

              <SectionCard compact>
                <Typography variant="h6" gutterBottom>Jugadores</Typography>
                <PlayersList
                  snapshot={snapshot}
                  activePlayerId={activeId}
                  activeTeam={activeTeam}
                  activePlayerName={activePlayerName}
                />
              </SectionCard>
            </Grid>
          </Grid>
        )}
      </Container>

      {snapshot && (
        <TurnAlert team={snapshot.turnTeam} teamName={teamNames[snapshot.turnTeam]} playerName={turnPlayerName} />
      )}

      {trivia && (
        <TriviaDialog trivia={trivia} teamNames={teamNames} onClose={() => setTrivia(null)} onAnswer={answerTrivia} />
      )}

      <Snackbar open={!!toast} autoHideDuration={3000} onClose={() => setToast(null)}>
        {trivia ? (
          <Alert severity={trivia.canAnswer ? 'success' : 'warning'} sx={{ mb: 2 }}>
            {trivia.canAnswer ? '¡Te toca responder!' : <>Responde <b>{trivia.playerName ?? 'jugador en turno'}</b> — <b>{teamNames[(trivia as any).team as Team] ?? ''}</b></>}
          </Alert>
        ) : (
          <Alert onClose={() => setToast(null)} severity="info" sx={{ width: '100%' }}>{toast}</Alert>
        )}
      </Snackbar>

      <EndGameModal
        open={!!gameOver}
        winnerTeamId={winnerTeamId}
        leaderboard={finalLeaderboard}
        onRestart={() => ws?.send(JSON.stringify({ type: 'restartGame' }))}
        onExit={leaveGame}
        title="¡Partida terminada!"
      />

      {/* Diálogo de código de sala para ver tablero */}
      <Dialog open={askCodeOpen} onClose={() => setAskCodeOpen(false)}>
        <DialogTitle>Ver tablero</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Código de la sala"
            fullWidth
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value.toUpperCase())}
            inputProps={{ style: { textTransform: 'uppercase', letterSpacing: '2px' } }}
            placeholder="ABCD"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAskCodeOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={confirmWatch}>Ver</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
