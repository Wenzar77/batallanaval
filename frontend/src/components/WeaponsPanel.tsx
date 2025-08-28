// src/components/WeaponsPanel.tsx
import { Chip, Stack, Tooltip } from '@mui/material';
import { WEAPON_DESCRIPTIONS, WEAPON_ICONS, WEAPON_ORDER } from '../utils/weapons';

type WeaponsPanelProps = {
  weaponCounts: Record<string, number>;
  weaponToUse: string | null;
  setWeaponToUse: (w: string | null) => void;
};

export default function WeaponsPanel({
  weaponCounts,
  weaponToUse,
  setWeaponToUse,
}: WeaponsPanelProps) {
  // Normaliza en un arreglo ordenado solo las armas con cantidad > 0
  const entries = (WEAPON_ORDER.length ? WEAPON_ORDER : Object.keys(weaponCounts))
    .map((k) => [k, weaponCounts[k] as number] as const)
    .filter(([, count]) => (count ?? 0) > 0);

  return (
    <Stack direction="row" spacing={1} flexWrap="wrap">
      {entries.map(([weapon, count]) => {
        const Icon = WEAPON_ICONS[weapon];
        const desc = WEAPON_DESCRIPTIONS[weapon] ?? '';

        return (
          <Tooltip key={weapon} title={desc} arrow>
            <Chip
              icon={Icon ? <Icon fontSize="small" /> : undefined}
              label={`${weapon} (${count})`}
              color={weaponToUse === weapon ? 'primary' : 'default'}
              onClick={() => setWeaponToUse(weaponToUse === weapon ? null : weapon)}
              sx={{
                cursor: 'pointer',
                textTransform: 'none',
                '& .MuiChip-icon': { ml: 0.25 }, // un pelín de respiro
              }}
              variant={weaponToUse === weapon ? 'filled' : 'outlined'}
              size="small"
            />
          </Tooltip>
        );
      })}
    </Stack>
  );
}
