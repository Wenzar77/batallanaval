import React from 'react';
import { Box, Alert, Stack, Avatar } from '@mui/material';
import type { Team } from '../types/game';
import { TEAM_ICONS } from '../utils/fleet';

const TurnAlert: React.FC<{ team: Team; teamName: string; playerName?: string | null }>= ({ team, teamName, playerName }) => (
  <Box sx={{ mt: 2, mx: { xs: 2, sm: 3 } }}>
    <Alert severity="info" icon={false} sx={{ display: 'flex', alignItems: 'center', gap: 1, fontSize: 16, '& .MuiAlert-message': { width: '100%' } }}>
      <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
        <Avatar sx={{ width: 26, height: 26, fontSize: 16 }}>{TEAM_ICONS[team]}</Avatar>
        <b>{teamName}</b>
        <span>•</span>
        <span>{playerName ? <>Turno de <b>{playerName}</b></> : <>Esperando jugador del equipo</>}</span>
      </Stack>
    </Alert>
  </Box>
);
export default TurnAlert;