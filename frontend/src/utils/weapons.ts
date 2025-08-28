// src/utils/weapons.ts
import BoltIcon from '@mui/icons-material/Bolt';            // doubleShot
import BlurCircularIcon from '@mui/icons-material/BlurCircular'; // bomb3x3
import AddIcon from '@mui/icons-material/Add';              // crossMissile (cruz)
import RadarIcon from '@mui/icons-material/Radar';          // radar
import type { SvgIconComponent } from '@mui/icons-material';

export const WEAPON_DESCRIPTIONS: Record<string, string> = {
  doubleShot: 'Dispara dos veces seguidas en el mismo turno.',
  bomb3x3: 'Impacta un área de 3×3 celdas.',
  crossMissile: 'Ataca en cruz (fila y columna del objetivo).',
  radar: 'Escanea un área y revela barcos (no causa daño).',
};

export const WEAPON_ICONS: Record<string, SvgIconComponent> = {
  doubleShot: BoltIcon,
  bomb3x3: BlurCircularIcon,
  crossMissile: AddIcon,
  radar: RadarIcon,
};

// (Opcional) Orden para mostrar
export const WEAPON_ORDER = ['doubleShot', 'bomb3x3', 'crossMissile', 'radar'];
