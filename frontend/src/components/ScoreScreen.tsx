// src/components/ScoreScreen.tsx
import React from 'react';
import {
  Box, Paper, Typography, Stack, Chip, Avatar, Grid
} from '@mui/material';

// Tipos mínimos para que sea independiente del archivo App
type Team = 'A' | 'B';

type Snapshot = {
  code: string;
  state: 'lobby' | 'active' | `finished_A` | `finished_B`;
  turnTeam: Team;
  teamNames?: { A: string; B: string };
  weapons: Record<Team, string[]>;
  shipsRemaining: Record<Team, number>;
  scores?: {
    teams: Record<Team, number>;
    players: { id: string; name: string; team: Team; points: number }[];
  };
};

type Props = {
  snapshot: Snapshot;
  teamNames: { A: string; B: string };          // ya viene con fallback aplicado
  teamIcons: { A: string; B: string };          // íconos (🐆 / 🦜) desde App
};

export default function ScoreScreen({ snapshot, teamNames, teamIcons }: Props) {
  const scores = snapshot.scores ?? { teams: { A: 0, B: 0 }, players: [] };
  const totalTeamA = scores.teams.A || 0;
  const totalTeamB = scores.teams.B || 0;
  const maxTeam = Math.max(1, totalTeamA, totalTeamB);
  const playersSorted = [...scores.players].sort((a, b) => b.points - a.points);

  return (
    <Box sx={{ p: 3, bgcolor: 'whitesmoke', minHeight: '100vh', color: '#111' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h4">Sala {snapshot.code}</Typography>
        <Chip
          color="info"
          label={
            snapshot.state === 'active'
              ? `Turno: ${snapshot.turnTeam === 'A' ? teamNames.A : teamNames.B}`
              : snapshot.state.startsWith('finished_')
              ? `Ganó ${snapshot.state.endsWith('A') ? teamNames.A : teamNames.B}`
              : 'En lobby'
          }
          sx={{ fontSize: 18, p: 2 }}
        />
      </Stack>

      <Grid container spacing={3}>
        {/* Marcador Equipo A */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, bgcolor: '#fff' }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Avatar sx={{ width: 28, height: 28, fontSize: 18 }}>{teamIcons.A}</Avatar>
              <Typography variant="h5" gutterBottom>{teamNames.A} (A)</Typography>
            </Stack>
            <Typography variant="h3" sx={{ mb: 1 }}>{totalTeamA} pts</Typography>
            <Box sx={{ bgcolor: '#e0e0e0', height: 18, borderRadius: 1 }}>
              <Box sx={{ width: `${(totalTeamA / maxTeam) * 100}%`, height: 18, bgcolor: '#42a5f5', borderRadius: 1 }} />
            </Box>
            <Typography sx={{ mt: 2 }}>Barcos restantes: {snapshot.shipsRemaining.A}</Typography>
            <Typography>Armas: {snapshot.weapons.A.length ? snapshot.weapons.A.join(', ') : '—'}</Typography>
          </Paper>
        </Grid>

        {/* Marcador Equipo B */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, bgcolor: '#fff' }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Avatar sx={{ width: 28, height: 28, fontSize: 18 }}>{teamIcons.B}</Avatar>
              <Typography variant="h5" gutterBottom>{teamNames.B} (B)</Typography>
            </Stack>
            <Typography variant="h3" sx={{ mb: 1 }}>{totalTeamB} pts</Typography>
            <Box sx={{ bgcolor: '#e0e0e0', height: 18, borderRadius: 1 }}>
              <Box sx={{ width: `${(totalTeamB / maxTeam) * 100}%`, height: 18, bgcolor: '#66bb6a', borderRadius: 1 }} />
            </Box>
            <Typography sx={{ mt: 2 }}>Barcos restantes: {snapshot.shipsRemaining.B}</Typography>
            <Typography>Armas: {snapshot.weapons.B.length ? snapshot.weapons.B.join(', ') : '—'}</Typography>
          </Paper>
        </Grid>

        {/* Tabla de jugadores */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, bgcolor: '#fff' }}>
            <Typography variant="h5" gutterBottom>Jugadores</Typography>
            <Grid container spacing={2}>
              {playersSorted.map((p, idx) => (
                <Grid key={p.id} item xs={12} md={6} lg={4}>
                  <Paper sx={{ p: 2, bgcolor: '#fff', display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Chip
                      label={idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : idx + 1}
                      color={p.team === 'A' ? 'primary' : 'success'}
                    />
                    <Avatar sx={{ width: 28, height: 28, fontSize: 16 }}>
                      {p.team === 'A' ? teamIcons.A : teamIcons.B}
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography sx={{ fontWeight: 700 }}>{p.name}</Typography>
                      <Typography variant="body2" sx={{ opacity: 0.8 }}>
                        {p.team === 'A' ? teamNames.A : teamNames.B}
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
