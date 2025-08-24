// src/components/EndGameModal.tsx
import * as React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  Box, Typography, Table, TableHead, TableRow, TableCell, TableBody, Chip, Stack, Divider
} from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

export type LeaderboardRow = {
  teamId: string;       // 'A' | 'B' | ...
  teamName: string;     // Jaguares / Guacamayas ...
  points: number;
  hits?: number;        // opcional
  sinks?: number;       // opcional
  trivia?: number;      // opcional
};

export const EndGameModal: React.FC<{
  open: boolean;
  onRestart: () => void;
  onExit: () => void;
  leaderboard: LeaderboardRow[];
  winnerTeamId?: string | null; // si es null => empate
  title?: string;
}> = ({ open, onRestart, onExit, leaderboard, winnerTeamId, title }) => {
  const sorted = React.useMemo(
    () => [...leaderboard].sort((a, b) => b.points - a.points),
    [leaderboard]
  );

  const winner = React.useMemo(() => {
    if (winnerTeamId == null) return null;
    return sorted.find(r => r.teamId === winnerTeamId) ?? null;
  }, [sorted, winnerTeamId]);

  const hasBreakdown = sorted.some(r => r.hits != null || r.sinks != null || r.trivia != null);

  return (
    <Dialog open={open} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <EmojiEventsIcon fontSize="small" />
        {title ?? '¡Fin del juego!'}
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2}>
          {winnerTeamId === null ? (
            <Box>
              <Typography variant="h5" fontWeight={700}>¡Empate!</Typography>
              <Typography color="text.secondary">Ambos equipos terminaron con el mismo puntaje.</Typography>
            </Box>
          ) : (
            winner && (
              <Box>
                <Typography variant="overline" color="text.secondary">Equipo ganador</Typography>
                <Typography variant="h4" fontWeight={800}>
                  {winner.teamName}
                </Typography>
                <Chip
                  label={`${winner.points} pts`}
                  color="success"
                  sx={{ mt: 1, fontWeight: 700 }}
                />
              </Box>
            )
          )}

          <Divider />

          <Box>
            <Typography variant="h6" sx={{ mb: 1 }}>Tabla de posiciones</Typography>
            <Table size="small" aria-label="tabla de posiciones">
              <TableHead>
                <TableRow>
                  <TableCell>Pos</TableCell>
                  <TableCell>Equipo</TableCell>
                  <TableCell align="right">Puntos</TableCell>
                  {hasBreakdown && (
                    <>
                      <TableCell align="right">Aciertos</TableCell>
                      <TableCell align="right">Hundidos</TableCell>
                      <TableCell align="right">Trivia</TableCell>
                    </>
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {sorted.map((r, idx) => {
                  const isWinner = winnerTeamId != null && r.teamId === winnerTeamId;
                  return (
                    <TableRow key={r.teamId} hover selected={isWinner}>
                      <TableCell>{idx + 1}</TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography fontWeight={700}>{r.teamName}</Typography>
                          {isWinner && (
                            <Chip size="small" label="Ganador" color="warning" />
                          )}
                        </Stack>
                      </TableCell>
                      <TableCell align="right">
                        <Typography fontWeight={700}>{r.points}</Typography>
                      </TableCell>
                      {hasBreakdown && (
                        <>
                          <TableCell align="right">{r.hits ?? '-'}</TableCell>
                          <TableCell align="right">{r.sinks ?? '-'}</TableCell>
                          <TableCell align="right">{r.trivia ?? '-'}</TableCell>
                        </>
                      )}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Box>

          {/* Si prefieres, coloca aquí tu <ScoreScreen ... /> */}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button variant="outlined" onClick={onExit}>Salir al lobby</Button>
        <Button variant="contained" onClick={onRestart}>Reiniciar partida</Button>
      </DialogActions>
    </Dialog>
  );
};
