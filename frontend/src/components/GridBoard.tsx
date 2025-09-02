import React, { useEffect, useRef } from 'react';
import { Box } from '@mui/material';
import { useSound } from '../sound/SoundProvider';

export const Cell: React.FC<{
  size: number;
  state: 'unknown' | 'hit' | 'miss' | 'ship';
}> = ({ size, state }) => {
  const bg =
    state === 'hit'  ? '#d32f2f' :
    state === 'miss' ? 'rgba(215, 240, 244, 0.92)' :
    state === 'ship' ? '#73a075ff' :
                       '#e0e0e0';

  return (
    <Box
      sx={{
        width: size,
        height: size,
        bgcolor: bg,
        border: '1px solid rgba(215, 240, 244, 0.92)',
        borderRadius: 0.1,
      }}
    />
  );
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
}> = ({ size, hits, misses, onClick, disabled, ownShips, showShips, cellSize }) => {
  const { play } = useSound();

  // Refs para recordar el estado anterior y calcular deltas
  const prevHitsRef   = useRef<Set<string>>(new Set());
  const prevMissesRef = useRef<Set<string>>(new Set());
  const lastSoundAtRef = useRef<number>(0); // simple "cooldown" (opcional)

  useEffect(() => {
    // calcular celdas NUEVAS impactadas/erradas (no las que ya estaban)
    const prevHits = prevHitsRef.current;
    const prevMisses = prevMissesRef.current;

    let newHits = 0;
    for (const k of hits) if (!prevHits.has(k)) newHits++;

    let newMisses = 0;
    for (const k of misses) if (!prevMisses.has(k)) newMisses++;

    // Cooldown opcional para evitar spam en frames muy seguidos
    const now = performance.now();
    const canPlay = (ms = 120) => now - lastSoundAtRef.current > ms;

    if (newHits > 0 && canPlay()) {
      play('hit');              // solo 1 sonido por batch de impactos
      lastSoundAtRef.current = now;
    } else if (newMisses > 0 && canPlay()) {
      play('miss');             // solo 1 sonido por batch de fallos
      lastSoundAtRef.current = now;
    }

    // actualizar refs para el siguiente diff
    prevHitsRef.current = new Set(hits);
    prevMissesRef.current = new Set(misses);
  }, [hits, misses, play]);

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: `repeat(${size}, ${cellSize}px)`, gap: 0, touchAction: 'manipulation' }}>
      {Array.from({ length: size }).map((_, i) =>
        Array.from({ length: size }).map((_, j) => {
          const key = `${i},${j}`;
          const isHit = hits.has(key);
          const isMiss = misses.has(key);
          const isShip = !!ownShips?.has(key);
          const state: 'unknown' | 'hit' | 'miss' | 'ship' =
            isHit ? 'hit' : isMiss ? 'miss' : (showShips && isShip) ? 'ship' : 'unknown';

          return (
            <Box
              key={key}
              onClick={() => !disabled && onClick && onClick(i, j)}
              sx={{ cursor: disabled ? 'not-allowed' : 'pointer' }}
            >
              <Cell size={cellSize} state={state} />
            </Box>
          );
        })
      )}
    </Box>
  );
};

export default GridBoard;
