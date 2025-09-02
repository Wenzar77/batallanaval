import { memo, useMemo, useCallback } from 'react';
import { Box, Stack, Typography, Chip, Button, Divider, Avatar, Paper } from '@mui/material';
import type { Team } from '../types/game';

type Player = {
  id: string | number;
  clientId?: string | number;
  name: string;
  team: Team;
};

type SnapshotLite = {
  players: Player[];
  teamNames?: { A: string; B: string };
};

export default memo(function TeamLobbyPanel({
  snapshot,
  clientId,
  team,
  setTeam,
  onLeave,
  ws
}: {
  snapshot: SnapshotLite | null | undefined;
  clientId: string;
  team: Team;
  setTeam: (t: Team) => void;
  onLeave: () => void;
  ws: WebSocket | null;
}) {
  const teamNames = snapshot?.teamNames ?? { A: 'Jaguares', B: 'Guacamayas' };

  const { playersA, playersB } = useMemo(() => {
    const list = snapshot?.players ?? [];
    return {
      playersA: list.filter(p => p.team === 'A'),
      playersB: list.filter(p => p.team === 'B'),
    };
  }, [snapshot]);

  const myClientId = String(clientId);

  const changeTeam = useCallback((to: Team) => {
    if (!ws) return;
    ws.send(JSON.stringify({ type: 'changeTeam', team: to }));
    setTeam(to);
  }, [ws, setTeam]);

  const renderList = (players: Player[]) => (
    <Stack spacing={1} sx={{ mt: 1 }}>
      {players.length === 0 && (
        <Typography variant="body2" color="text.secondary">Sin jugadores…</Typography>
      )}
      {players.map((p) => {
        const isMe = String(p.clientId ?? p.id) === myClientId;
        return (
          <Stack
            key={`${p.team}-${p.id}-${p.clientId ?? ''}`}
            direction="row"
            alignItems="center"
            spacing={1}
            sx={{
              p: 1,
              borderRadius: 1,
              bgcolor: isMe ? 'action.selected' : 'transparent',
            }}
          >
            <Avatar sx={{ width: 28, height: 28 }}>{(p.name ?? '?').slice(0, 1).toUpperCase()}</Avatar>
            <Typography component='div'>
              {p.name || 'Jugador'}
              {isMe && <Chip size="small" label="Tú" color="primary" sx={{ ml: 1 }} />}
            </Typography>
          </Stack>
        );
      })}
    </Stack>
  );

  return (
    <Paper variant="outlined" sx={{ mt: 2, p: 2, borderRadius: 2 }}>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
        {/* Equipo A */}
        <Box sx={{ flex: 1 }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Chip size="small" color="default" label="Equipo A" />
            <Typography variant="subtitle1" fontWeight={600}>{teamNames.A}</Typography>
            <Chip size="small" variant="outlined" label={playersA.length} sx={{ ml: 'auto' }} />
          </Stack>
          {renderList(playersA)}
          <Button
            fullWidth
            variant={team === 'A' ? 'contained' : 'outlined'}
            sx={{ mt: 1.5 }}
            onClick={() => changeTeam('A')}
          >
            {team === 'A' ? 'Estás en este equipo' : `Cambiar a ${teamNames.A}`}
          </Button>
        </Box>

        <Divider flexItem orientation="vertical" sx={{ display: { xs: 'none', md: 'block' } }} />

        {/* Equipo B */}
        <Box sx={{ flex: 1 }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Chip size="small" color="default" label="Equipo B" />
            <Typography variant="subtitle1" fontWeight={600}>{teamNames.B}</Typography>
            <Chip size="small" variant="outlined" label={playersB.length} sx={{ ml: 'auto' }} />
          </Stack>
          {renderList(playersB)}
          <Button
            fullWidth
            variant={team === 'B' ? 'contained' : 'outlined'}
            sx={{ mt: 1.5 }}
            onClick={() => changeTeam('B')}
          >
            {team === 'B' ? 'Estás en este equipo' : `Cambiar a ${teamNames.B}`}
          </Button>
        </Box>
      </Stack>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mt: 2 }}>
        <Button color="error" variant="outlined" onClick={onLeave} fullWidth>Salir de la sala</Button>
      </Stack>
    </Paper>
  );
});
