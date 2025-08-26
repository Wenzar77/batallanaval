import React from 'react';
import { Stack, Chip, Alert } from '@mui/material';
import RadarIcon from '@mui/icons-material/Radar';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import AddchartIcon from '@mui/icons-material/Addchart';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

const iconFor = (w: string) => w === 'radar' ? <RadarIcon/> : w === 'bomb3x3' ? <WhatshotIcon/> : w === 'crossMissile' ? <AddchartIcon/> : <HelpOutlineIcon/>;

const WeaponsPanel: React.FC<{
  weaponCounts: Record<string, number>;
  weaponToUse: string | null;
  setWeaponToUse: (w: string | null) => void;
}> = ({ weaponCounts, weaponToUse, setWeaponToUse }) => (
  <>
    <Stack direction="row" spacing={1} flexWrap="wrap">
      {Object.entries(weaponCounts).length === 0 && <Chip label="Sin armas" size="small"/>}
      {Object.entries(weaponCounts).map(([w, count]) => (
        <Chip key={w} clickable color={weaponToUse === w ? 'success' : 'primary'} onClick={() => setWeaponToUse(w)} label={`${w} x${count}`} icon={iconFor(w)} size="small" />
      ))}
    </Stack>
    {weaponToUse && (
      <Alert sx={{ mt: 2 }} severity="info">Arma seleccionada: <b>{weaponToUse}</b>. Toca el tablero para usarla.</Alert>
    )}
  </>
);
export default WeaponsPanel;