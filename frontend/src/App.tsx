import { useEffect, useMemo, useState } from 'react';
import { Container, Stack, Typography, Chip, Divider, Snackbar, Alert, Box, Grid } from '@mui/material';
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
import { buildScreenUrl, ensureTokenInURL, readQS, setQS, QS_CODE, QS_TOKEN } from './utils/url';
import type { Snapshot, Team, TriviaMsg, TeamBreakdown } from './types/game';

const isScreen = typeof window !== 'undefined' && window.location.pathname.endsWith('/screen');

export default function App() {
  const { isXs, cellSize, boardScrollMaxW } = useResponsiveBoard();

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
  const [myFleetCells, setMyFleetCells] = useState<string[] | null>(null);

  let wasActive = false;
  const leaveGame = () => {
    if (!ws) return;
    ws.send(JSON.stringify({ type: 'leaveRoom' }));
    setSnapshot(null); setIsHost(false); setCode(''); setMode('crear');
    setQS({ [QS_CODE]: null, [QS_TOKEN]: null });
  };

  const teamNames = snapshot?.teamNames ?? DEFAULT_TEAM_NAMES;
  const enemyTeam: Team = team === 'A' ? 'B' : 'A';
  const turnPlayer = snapshot?.turnPlayerId ? snapshot.players.find(p => p.id === snapshot.turnPlayerId) : undefined;
  const turnPlayerName = turnPlayer?.name ?? null;

  useEffect(() => {
    const wsUrl = (import.meta.env.VITE_WS_URL as string) || 'ws://localhost:3000/ws';
    let socket: WebSocket | null = null; let retry = 0; let closedByUs = false; let gotFirstSnapshot = false;
    const connect = () => {
      socket = new WebSocket(wsUrl);
      socket.onopen = () => {
        setWs(socket); setConnected(true); retry = 0;
        const qs = readQS();
        let urlCode = (qs.get(QS_CODE) ?? '').toUpperCase();
        let urlToken = qs.get(QS_TOKEN) ?? '';
        if (!urlCode && code) { urlCode = code; setQS({ [QS_CODE]: code }); }
        if (!urlToken) { urlToken = ensureTokenInURL(); setClientId(urlToken); } else if (!clientId) { setClientId(urlToken); }
        if (urlCode && urlToken) {
          socket!.send(JSON.stringify({ type: 'resume', code: urlCode, clientId: urlToken }));
          setTimeout(() => {
            if (!socket || socket.readyState !== 1) return;
            if (!gotFirstSnapshot) {
              socket.send(JSON.stringify({ type: 'joinRoom', code: urlCode, name: name || 'Jugador', team, clientId: urlToken }));
            }
          }, 600);
        }
        setTimeout(() => { try { socket?.send(JSON.stringify({ type: 'requestMyFleet' })); } catch { } }, 800);
      };
      socket.onmessage = (ev) => {
        const data = JSON.parse(ev.data);
        if (data.type === 'roomCreated') {
          const newCode: string = data.code; setCode(newCode);
          const token = clientId || ensureTokenInURL(); if (!clientId) setClientId(token);
          setQS({ [QS_CODE]: newCode, [QS_TOKEN]: token });
        }
        if (data.type === 'roomUpdate') { gotFirstSnapshot = true; setSnapshot(data.snapshot); if (!data.snapshot.trivia) setTrivia(null); }
        if (data.type === 'toast') setToast(data.message);
        if (data.type === 'trivia') setTrivia(data);
        if (data.type === 'triviaEnd') setTrivia(null);
        if (data.type === 'left') { setSnapshot(null); setIsHost(false); setCode(''); setMode('crear'); setQS({ [QS_CODE]: null, [QS_TOKEN]: null }); }
        if (data.type === 'myFleetCells' && Array.isArray(data.cells)) setMyFleetCells(data.cells);
        if (data.type === 'playerBoard' && Array.isArray(data.shipCells)) setMyFleetCells(data.shipCells);
        const isActive = data.snapshot?.state === 'active';
        if (isActive && !wasActive) { wasActive = true; try { ws?.send(JSON.stringify({ type: 'requestMyFleet' })); } catch { } }
      };
      socket.onclose = () => { setConnected(false); setWs(null); if (!closedByUs) { const delay = Math.min(1000 * 2 ** retry, 8000); retry += 1; setTimeout(connect, delay); } };
      socket.onerror = () => { };
    };
    connect();
    return () => { closedByUs = true; try { socket?.close(); } catch { } };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!trivia) return; const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setTrivia(null); };
    window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey);
  }, [trivia]);

  const hitsEnemy = useMemo(() => (!snapshot ? new Set<string>() : new Set(team === 'A' ? snapshot.history.A : snapshot.history.B)), [snapshot, team]);
  const missesEnemy = useMemo(() => (!snapshot ? new Set<string>() : new Set(team === 'A' ? snapshot.history.Amiss : snapshot.history.Bmiss)), [snapshot, team]);
  const hitsMine = useMemo(() => (!snapshot ? new Set<string>() : new Set(team === 'A' ? snapshot.history.B : snapshot.history.A)), [snapshot, team]);
  const missesMine = useMemo(() => (!snapshot ? new Set<string>() : new Set(team === 'A' ? snapshot.history.Bmiss : snapshot.history.Amiss)), [snapshot, team]);
  const ownShips = useMemo(() => (myFleetCells?.length ? new Set(myFleetCells) : new Set(!snapshot ? [] : getTeamShipCells(snapshot, team, clientId))), [snapshot, team, clientId, myFleetCells]);
  const myTurn = !!(snapshot && snapshot.state === 'active' && snapshot.turnTeam === team);

  const createRoom = () => { if (!ws) return; setIsHost(true); const token = clientId || ensureTokenInURL(); if (!clientId) setClientId(token); ws.send(JSON.stringify({ type: 'createRoom', name: name || 'Host', team, clientId: token })); };
  const joinRoom = () => { if (!ws || !code) return; setIsHost(false); const token = clientId || ensureTokenInURL(); if (!clientId) setClientId(token); setQS({ [QS_CODE]: code, [QS_TOKEN]: token }); ws.send(JSON.stringify({ type: 'joinRoom', code, name: name || 'Jugador', team, clientId: token })); };
  const startGame = () => ws && ws.send(JSON.stringify({ type: 'startGame' }));
  const fireAt = (i: number, j: number) => { if (!ws || !myTurn) return; const weapon = weaponToUse || undefined; ws.send(JSON.stringify({ type: 'fire', x: i, y: j, weapon })); if (weapon === 'doubleShot') { if (doubleShotPending === 0) setDoubleShotPending(1); else { setDoubleShotPending(0); setWeaponToUse(null); } } else { setWeaponToUse(null); } };
  const answerTrivia = (idx: number) => { if (!ws || !trivia) return; ws.send(JSON.stringify({ type: 'answerTrivia', nonce: trivia.nonce, answerIndex: idx })); setTrivia(null); };

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

  if (isScreen && snapshot) return (<ScoreScreen snapshot={snapshot} teamNames={teamNames} teamIcons={TEAM_ICONS} activePlayerId={snapshot.turnPlayerId ?? null} />);

  return (
    <>
      <HeaderBar snapshot={snapshot} teamNames={teamNames} code={code} connected={connected} onLeave={leaveGame} setToast={setToast} />
      <Container sx={{ mt: 3, pb: 3 }}>
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
            <Lobby name={name} setName={setName} team={team} setTeam={setTeam} mode={mode} setMode={setMode} code={code} setCode={setCode} teamNames={teamNames} isHost={isHost} onCreate={createRoom} onStart={startGame} onJoin={joinRoom} />
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
                    <Chip label={snapshot.state === 'active' ? ((snapshot.turnTeam === team) ? 'Tu turno' : 'Turno rival') : snapshot.state} color={(snapshot.state === 'active' && snapshot.turnTeam === team) ? 'success' : 'default'} size="small" />
                    <Chip variant="outlined" color="primary" size="small" label={`Objetivo: ${teamNames[enemyTeam]} · ${snapshot.shipsRemaining[enemyTeam]}/${FLEET_TOTAL_SHIPS}`} />
                  </Stack>
                </Stack>
                <Box sx={{ mt: 2, overflowX: 'auto', overflowY: 'hidden', WebkitOverflowScrolling: 'touch', maxWidth: boardScrollMaxW, pb: 1 }}>
                  <GridBoard size={SIZE} hits={hitsEnemy} misses={missesEnemy} onClick={fireAt} disabled={!myTurn || gameOver} cellSize={cellSize} />
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
                <Typography variant="h6" gutterBottom>Armas del equipo {team} ({teamNames[team]})</Typography>
                <WeaponsPanel weaponCounts={weaponCounts} weaponToUse={weaponToUse} setWeaponToUse={setWeaponToUse} />
              </SectionCard>

              <SectionCard compact>
                <Typography variant="h6" gutterBottom>Jugadores</Typography>
                <PlayersList snapshot={snapshot} />
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

      <EndGameModal open={!!gameOver} winnerTeamId={winnerTeamId} leaderboard={finalLeaderboard} onRestart={() => ws?.send(JSON.stringify({ type: 'restartGame' }))} onExit={leaveGame} title="¡Partida terminada!" />
    </>
  );
}