import React from 'react';
import {
  AppBar, Toolbar, Typography, Chip, Button, Tooltip, Box, IconButton
} from '@mui/material';
import TvIcon from '@mui/icons-material/Tv';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import NotificationsActiveOutlinedIcon from '@mui/icons-material/NotificationsActiveOutlined';
import NotificationsOffOutlinedIcon from '@mui/icons-material/NotificationsOffOutlined';
import { useTheme } from '@mui/material/styles';
import { useMediaQuery } from '@mui/material';
import type { Snapshot, Team } from '../types/game';
import { buildScreenUrl } from '../utils/url';
import { useSound } from '../sound/SoundProvider';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

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

  const { isMuted, toggleMute } = useSound(); // ⬅️ estado global de sonido

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
      <Toolbar sx={{ minHeight: isXs ? 56 : 64, gap: 1 }}>
        {/* Título */}
        <Typography
          variant={isXs ? 'subtitle1' : 'h6'}
          sx={{ fontFamily: "'Special Elite', cursive" }} // fuente militar que te gustó
        >
          Batalla Naval
        </Typography>

        {/* Empuja el resto hacia la derecha */}
        <Box sx={{ flexGrow: 1 }} />

        {/* Estado de conexión */}
        <Chip
          icon={connected ? <CheckCircleIcon /> : <CancelIcon />}
          color={connected ? 'success' : 'error'}
          label={connected ? '' : ''}   // 👈 sin texto
          size={isXs ? 'small' : 'medium'}
          sx={{
            mr: 1,
            maxWidth: isXs ? 40 : 48,   // ancho más compacto
            '& .MuiChip-label': { display: 'none' } // oculta espacio de label
          }}
        />

        {/* Toggle Sonido */}
        <Tooltip title={isMuted ? 'Modo silencioso' : 'Sonidos activados'}>
          <IconButton
            color="inherit"
            onClick={toggleMute}
            aria-label={isMuted ? 'Activar sonidos' : 'Silenciar sonidos'}
            sx={{ mr: 1 }}
          >
            {isMuted ? (
              <NotificationsOffOutlinedIcon />
            ) : (
              <NotificationsActiveOutlinedIcon />
            )}
          </IconButton>
        </Tooltip>

        {/* Botón TABLERO */}
        <Tooltip
          title={
            roomCode
              ? 'Abrir tablero en una nueva pestaña'
              : 'Ver tablero: ingresar código de sala'
          }
        >
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

        {/* Desconectar (solo si el juego empezó/terminó) */}
        {connected && gameStarted && (
          <Tooltip title="Desconectarte de la sala">
            <Button
              onClick={onLeave}
              color="error"
              variant="contained"
              startIcon={<PowerSettingsNewIcon />}
              sx={{
                ml: 1,
                bgcolor: 'white',
                color: 'error.main',
                fontWeight: 'bold',
                '&:hover': { bgcolor: 'grey.100' },
              }}
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
