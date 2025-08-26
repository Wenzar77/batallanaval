import React from 'react';
import { Stack, Avatar, Typography, Chip } from '@mui/material';
import type { Snapshot } from '../types/game';
import { TEAM_ICONS } from '../utils/fleet';

const PlayersList: React.FC<{ snapshot: Snapshot }>= ({ snapshot }) => (
  <Stack spacing={1}>
    {snapshot.players.map((p) => {
      const playerScore = snapshot.scores?.players.find(sp => sp.id === p.id)?.points ?? 0;
      return (
        <Stack key={p.id} direction="row" alignItems="center" spacing={1}>
          <Avatar sx={{ width: 28, height: 28, fontSize: 16 }}>{TEAM_ICONS[p.team]}</Avatar>
          <Typography sx={{ flexGrow: 1, minWidth: 0, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
            {p.name}
          </Typography>
          <Chip size="small" color="success" label={`${playerScore} pts`} />
        </Stack>
      );
    })}
  </Stack>
);
export default PlayersList;