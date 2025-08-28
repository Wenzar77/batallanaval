import { Paper } from '@mui/material';
import React from 'react';

const SectionCard: React.FC<React.PropsWithChildren<{ compact?: boolean; disabledStyling?: boolean }>> = ({ children, compact, disabledStyling }) => (
  <Paper
    sx={{
      m: 2,
      p: compact ? 1.5 : 2,
      transition: 'all .25s ease',
      backgroundColor: 'rgba(215, 240, 244, 0.92)', // 👈 azul cielo translúcido
      borderRadius: 3,
      boxShadow: 3,
      ...(disabledStyling
        ? { filter: 'grayscale(0.4)', opacity: 0.6, pointerEvents: 'none' }
        : {}),
    }}
  >
    {children}
  </Paper>
);

export default SectionCard;
