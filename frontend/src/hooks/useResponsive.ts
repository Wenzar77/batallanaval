import { useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { SIZE } from '../utils/fleet';

export function useResponsiveBoard() {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down('sm'));
  const cellSize = isXs ? 20 : 22;
  const boardScrollMaxW = isXs ? `calc(${cellSize}px * ${SIZE} + 8px)` : 'unset';
  return { isXs, cellSize, boardScrollMaxW };
}