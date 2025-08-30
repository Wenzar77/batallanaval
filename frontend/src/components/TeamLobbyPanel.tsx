import { useState } from 'react';
import { Box, Typography, List, ListItem, ListItemText, Button, Chip, Stack, Divider } from '@mui/material';
import type { Snapshot, Team } from '../types/game';

type Props = {
  snapshot: Snapshot | null;
  clientId: string;
  team: Team;
  setTeam: (t: Team) => void;
  onLeave: () => void;
  ws: WebSocket | null;
};

export default function TeamLobbyPanel({ snapshot, clientId, team, setTeam, onLeave, ws }: Props) {
  const [changingTeam, setChangingTeam] = useState<Team | null>(null);

  const handleChangeTeam = (newTeam: Team) => {
    if (!ws || !snapshot) return;
    ws.send(JSON.stringify({ type: 'changeTeam', team: newTeam, clientId }));
    setTeam(newTeam);
    setChangingTeam(null);
  };

  const players = snapshot?.players ?? [];
  const teamNames = snapshot?.teamNames ?? { A: 'Jaguares', B: 'Guacamayas' };

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom>Jugadores en la sala</Typography>
      <Stack direction="row" spacing={2} mb={2}>
        <Chip label={`${teamNames.A}: ${players.filter(p => p.team === 'A').length}`} color={team === 'A' ? 'primary' : 'default'} />
        <Chip label={`${teamNames.B}: ${players.filter(p => p.team === 'B').length}`} color={team === 'B' ? 'primary' : 'default'} />
      </Stack>
      <List>
        {players.map((p) => (
          <ListItem key={p.id} secondaryAction={
            p.id === clientId && (
              <Stack direction="row" spacing={1}>
                <Button
                  size="small"
                  variant="outlined"
                  color={p.team === 'A' ? 'secondary' : 'primary'}
                  disabled={team === (p.team === 'A' ? 'B' : 'A')}
                  onClick={() => setChangingTeam(p.team === 'A' ? 'B' : 'A')}
                >
                  Cambiar a {teamNames[p.team === 'A' ? 'B' : 'A']}
                </Button>
                <Button size="small" color="error" onClick={onLeave}>Salir</Button>
              </Stack>
            )
          }>
            <ListItemText
              primary={p.name}
              secondary={teamNames[p.team]}
            />
          </ListItem>
        ))}
      </List>
      {changingTeam && (
        <Box mt={2}>
          <Divider />
          <Typography variant="body2" mt={1}>¿Seguro que quieres cambiarte a {teamNames[changingTeam]}?</Typography>
          <Button variant="contained" color="primary" onClick={() => handleChangeTeam(changingTeam)} sx={{ mt: 1 }}>
            Confirmar cambio
          </Button>
          <Button onClick={() => setChangingTeam(null)} sx={{ mt: 1, ml: 2 }}>
            Cancelar
          </Button>
        </Box>
      )}
    </Box>
  );
}