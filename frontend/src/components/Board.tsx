import React from 'react';
import { Box } from '@mui/material';

export const Cell: React.FC<{ size: number; state: 'unknown' | 'hit' | 'miss' | 'ship' }> = ({ size, state }) => {
  const bg = state === 'hit' ? '#d32f2f' : state === 'miss' ? '#90caf9' : state === 'ship' ? '#73a075ff' : '#e0e0e0';
  return <Box sx={{ width: size, height: size, bgcolor: bg, border: '1px solid rgba(215, 240, 244, 0.92)', borderRadius: 0.1 }} />;
};

const GridBoard: React.FC<{
  size: number;
  hits: Set<string>;
  misses: Set<string>;
  onClick?: (x: number, y: number) => void;
  disabled?: boolean;
  ownShips?: Set<string>;
  showShips?: boolean;
  cellSize: number;
}> = ({ size, hits, misses, onClick, disabled, ownShips, showShips, cellSize }) => (
  <Box sx={{ display: 'grid', gridTemplateColumns: `repeat(${size}, ${cellSize}px)`, gap: 0, touchAction: 'manipulation' }}>
    {Array.from({ length: size }).map((_, i) =>
      Array.from({ length: size }).map((_, j) => {
        const key = `${i},${j}`;
        const isHit = hits.has(key);
        const isMiss = misses.has(key);
        const isShip = !!ownShips?.has(key);
        const state: 'unknown' | 'hit' | 'miss' | 'ship' = isHit ? 'hit' : isMiss ? 'miss' : (showShips && isShip) ? 'ship' : 'unknown';
        return (
          <Box key={key} onClick={() => !disabled && onClick && onClick(i, j)} sx={{ cursor: disabled ? 'not-allowed' : 'pointer' }}>
            <Cell size={cellSize} state={state} />
          </Box>
        );
      })
    )}
  </Box>
);

export default GridBoard;