import { Paper } from '@mui/material';
import React from 'react';

const SectionCard: React.FC<React.PropsWithChildren<{ compact?: boolean; disabledStyling?: boolean }>> = ({ children, compact, disabledStyling }) => (
  <Paper
    sx={{ p: compact ? 1.5 : 2, transition: 'all .25s ease', ...(disabledStyling ? { filter: 'grayscale(0.4)', opacity: 0.6, pointerEvents: 'none' } : {}) }}
  >
    {children}
  </Paper>
);

export default SectionCard;