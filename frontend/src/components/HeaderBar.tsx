import { AppBar, Toolbar, Typography, Chip, Avatar, Button, Tooltip } from '@mui/material';
import TvIcon from '@mui/icons-material/Tv';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import React from 'react';
import { useTheme } from '@mui/material/styles';
import { useMediaQuery } from '@mui/material';
import type { Snapshot, Team } from '../types/game';
import { TEAM_ICONS } from '../utils/fleet';
import { buildScreenUrl } from '../utils/url';

const HeaderBar: React.FC<{
  snapshot: Snapshot | null;
  teamNames: Record<Team, string>;
  code: string;
  connected: boolean;
  onLeave: () => void;
  setToast: (s: string | null) => void;
  /** Si no hay código de sala, esto abre el diálogo para "Ver tablero" */
  onWatch?: () => void;
}> = ({ snapshot, teamNames, code, connected, onLeave, setToast, onWatch }) => {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down('sm'));

  const gameStarted =
    snapshot?.state === 'active' ||
    snapshot?.state === 'finished_A' ||
    snapshot?.state === 'finished_B';

  const roomCode = snapshot?.code || code;

  const handleOpenBoard = () => {
    if (roomCode) {
      const url = buildScreenUrl(roomCode);
      window.open(url, '_blank', 'noopener');
      return;
    }
    if (onWatch) {
      onWatch(); // abre el diálogo para ingresar código
    } else {
      setToast('No hay sala activa. Ingresa un código para ver el tablero.');
    }
  };

  return (
    <AppBar position="sticky" color="primary" enableColorOnDark>
      <Toolbar sx={{ minHeight: isXs ? 56 : 64 }}>
        <Typography
          variant={isXs ? 'subtitle1' : 'h6'}
          sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', gap: 1, overflow: 'hidden' }}
        >
          <Avatar sx={{ width: 28, height: 28, fontSize: 18 }}>{TEAM_ICONS.A}</Avatar>
          <b style={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{teamNames.A}</b>
          <span style={{ opacity: 0.7, margin: '0 6px' }}>vs</span>
          <Avatar sx={{ width: 28, height: 28, fontSize: 18 }}>{TEAM_ICONS.B}</Avatar>
          <b style={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{teamNames.B}</b>
        </Typography>

        <Chip
          color={connected ? 'success' : 'error'}
          label={connected ? 'WS conectado' : 'WS desconectado'}
          size={isXs ? 'small' : 'medium'}
          sx={{ mr: 1, maxWidth: isXs ? 140 : 'unset' }}
        />

        {/* 👇 Botón TABLERO ahora sí renderizado */}
        <Tooltip title={roomCode ? 'Abrir tablero en una nueva pestaña' : 'Ver tablero: ingresar código de sala'}>
          <span>
            <Button
              onClick={handleOpenBoard}
              variant="contained"
              startIcon={<TvIcon />}
              sx={{
                ml: 1,
                color: 'primary.main',
                bgcolor: 'white',
                fontWeight: 'bold',
                '&:hover': { bgcolor: 'grey.100' },
              }}
              size={isXs ? 'small' : 'medium'}
            >
              {isXs ? '' : 'TABLERO'}
            </Button>
          </span>
        </Tooltip>

        {/* Solo aparece cuando el juego ya empezó o terminó */}
        {connected && gameStarted && (
          <Tooltip title="Desconectarte de la sala">
            <Button
              onClick={onLeave}
              color="error"
              variant="contained"
              startIcon={<PowerSettingsNewIcon />}
              sx={{ ml: 1, bgcolor: 'white', color: 'error.main', fontWeight: 'bold', '&:hover': { bgcolor: 'grey.100' } }}
              size={isXs ? 'small' : 'medium'}
              aria-label="Desconectar"
            >
              {isXs ? '' : 'DESCONECTAR'}
            </Button>
          </Tooltip>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default HeaderBar;
