import React from 'react';
import { Stack, Typography, Avatar, LinearProgress, Divider, Chip } from '@mui/material';
import type { Team } from '../types/game';
import { FLEET_INFO, FLEET_TOTAL_SHIPS, TEAM_ICONS } from '../utils/fleet';

const FleetPanel: React.FC<{ teamNames: Record<Team, string>; shipsRemaining: Record<Team, number>; }> = ({ teamNames, shipsRemaining }) => {
  const remA = shipsRemaining.A; const remB = shipsRemaining.B;
  const sunkA = FLEET_TOTAL_SHIPS - remA; const sunkB = FLEET_TOTAL_SHIPS - remB;
  return (
    <>
      <Typography variant="h6" gutterBottom>Flota por equipo</Typography>
      {[('A' as Team), ('B' as Team)].map((t) => (
        <Stack key={t} spacing={0.5} sx={{ mb: 1.5 }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Avatar sx={{ width: 24, height: 24, fontSize: 14 }}>{TEAM_ICONS[t]}</Avatar>
            <Typography variant="subtitle2" sx={{ flexGrow: 1 }}>
              <b>{teamNames[t]}</b> — Restantes: {shipsRemaining[t]}/{FLEET_TOTAL_SHIPS} · Hundidos: {FLEET_TOTAL_SHIPS - shipsRemaining[t]}
            </Typography>
          </Stack>
          <LinearProgress variant="determinate" value={(shipsRemaining[t] / FLEET_TOTAL_SHIPS) * 100} />
        </Stack>
      ))}
      <Divider sx={{ my: 1.5 }} />
      <Typography variant="subtitle2" gutterBottom>Composición de flota (por equipo)</Typography>
      <Stack direction="row" spacing={1} flexWrap="wrap">
        {FLEET_INFO.map((f) => (
          <Chip key={f.key} label={`${f.emoji} ${f.label} (${f.size}) ×${f.count}`} variant="outlined" size="small" />
        ))}
      </Stack>
    </>
  );
};
export default FleetPanel;