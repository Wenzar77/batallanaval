import React from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Alert,
  Stack,
  Button
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import type { TriviaMsg, Team } from '../types/game';
import CountdownRing from '../components/CountDownRing';

const TriviaDialog: React.FC<{
  trivia: TriviaMsg;
  teamNames: Record<Team, string>;
  onClose: () => void;
  onAnswer: (idx: number) => void;
}> = ({ trivia, teamNames, onClose, onAnswer }) => (
  <Box
    sx={{
      position: 'fixed',
      inset: 0,
      bgcolor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      p: 2,
      zIndex: 9999
    }}
    onClick={onClose}
  >
    <Paper
      onClick={(e) => e.stopPropagation()}
      sx={{ p: 3, maxWidth: 600, width: '100%', position: 'relative' }}
      elevation={6}
    >
      {/* Encabezado + contador */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 1,
          gap: 2
        }}
      >
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          Pregunta sorpresa
        </Typography>

        {/* Contador regresivo circular */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CountdownRing
            seconds={10}
            size={72}
            strokeWidth={8}
            strokeColor="#ff5252"                 // rojo para urgencia
            trackColor="rgba(255,82,82,0.2)"
            textColor="#000"                       // número negro (ajusta a tu tema)
            resetKey={trivia?.nonce}               // reinicia con cada pregunta
          // onComplete opcional: el servidor suele manejar el timeout;
          // si quieres cerrar visualmente al llegar a 0, descomenta:
          // onComplete={() => { if (!trivia.canAnswer) return; onClose(); }}
          />
          <IconButton aria-label="Cerrar" onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </Box>

      <Alert severity={trivia.canAnswer ? 'success' : 'warning'} sx={{ mb: 2 }}>
        {trivia.canAnswer
          ? '¡Te toca responder!'
          : `Responde ${trivia.playerName ?? 'jugador en turno'} — ${teamNames[(trivia as any).team as 'A' | 'B'] ?? ''
          }`}
      </Alert>

      <Typography sx={{ mb: 2 }}>{trivia.card.q}</Typography>

      <Stack spacing={1}>
        {trivia.card.opts.map((opt, idx) => (
          <Button
            key={idx}
            variant="outlined"
            onClick={() => trivia.canAnswer && onAnswer(idx)}
            disabled={!trivia.canAnswer}
            fullWidth
          >
            {opt}
          </Button>
        ))}
      </Stack>

      <Stack direction="row" justifyContent="flex-end" spacing={1} sx={{ mt: 2 }}>
        <Button onClick={onClose}>Cerrar</Button>
      </Stack>
    </Paper>
  </Box>
);

export default TriviaDialog;
