// src/components/PlayersList.tsx
import React, { useMemo, useRef, useEffect } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Chip,
  Tooltip,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import type { Snapshot, Team } from '../types/game';
import { TEAM_ICONS } from '../utils/fleet';

type Props = {
  snapshot: Snapshot;
  /** Id activo tal como lo manda el server (ej: snapshot.turnPlayerId) */
  activePlayerId: string | null;
  /** Equipo en turno (fallback visual) */
  activeTeam: Team | null;
  /** Nombre del jugador activo (si lo tienes) */
  activePlayerName?: string | null;
};

/** Intenta extraer todos los posibles identificadores de un jugador y compararlos como string */
const playerMatchesId = (p: any, targetId: string) => {
  const candidates = [p?.id, p?.clientId, p?.sid, p?.socketId, p?.cid]
    .filter(Boolean)
    .map((v: any) => String(v));
  return candidates.includes(String(targetId));
};

const TeamHeader: React.FC<{ team: Team; name: string; highlight?: boolean }> = ({ team, name, highlight }) => {
  const color = team === 'A' ? 'success.main' : 'info.main';
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        mb: 1,
        p: highlight ? 0.5 : 0,
        borderRadius: highlight ? 2 : 0,
        border: highlight ? '1.5px solid' : 'none',
        borderColor: highlight ? color : 'transparent',
        boxShadow: highlight
          ? (theme) =>
              `0 0 0 2px ${alpha(theme.palette.common.black, 0)} inset,
               0 6px 18px ${team === 'A' ? alpha(theme.palette.success.main, 0.16) : alpha(theme.palette.info.main, 0.16)}`
          : 'none',
      }}
    >
      <Avatar
        sx={{
          bgcolor: 'background.paper',
          color,
          fontSize: 18,
          border: '1px solid',
          borderColor: color,
        }}
      >
        {TEAM_ICONS[team]}
      </Avatar>

      <Chip
        size="small"
        label={name}
        variant="outlined"
        sx={{ borderColor: color, color, fontWeight: 700 }}
      />

      {highlight && (
        <Chip
          size="small"
          color={team === 'A' ? 'success' : 'info'}
          label="Equipo en turno"
          sx={{ ml: 0.5, fontWeight: 700 }}
        />
      )}
    </Box>
  );
};

const PlayersList: React.FC<Props> = ({ snapshot, activePlayerId, activeTeam, activePlayerName }) => {
  const playersA = snapshot.players.filter((pl) => pl.team === 'A');
  const playersB = snapshot.players.filter((pl) => pl.team === 'B');
  const teamNames = snapshot.teamNames;

  // --- LOCAL ANTI-FLICKER ---
  const lastActiveIdRef = useRef<string | null>(null);
  const lastActiveTeamRef = useRef<Team | null>(null);

  // Intento de match exacto en este render:
  const exactActive = useMemo(() => {
    if (!activePlayerId) return null;
    const idStr = String(activePlayerId);
    return snapshot.players.find((pl) => playerMatchesId(pl, idStr)) ?? null;
  }, [snapshot.players, activePlayerId]);

  // Si hay match exacto, actualizamos los refs; si no, conservamos mientras el equipo en turno sea el mismo
  useEffect(() => {
    if (exactActive) {
      lastActiveIdRef.current = activePlayerId ? String(activePlayerId) : null;
      lastActiveTeamRef.current = exactActive.team as Team;
    } else {
      if (activeTeam && lastActiveTeamRef.current === activeTeam) {
        // mantener el último mientras no cambie el equipo
      } else {
        lastActiveIdRef.current = null;
        lastActiveTeamRef.current = activeTeam;
      }
    }
  }, [exactActive, activePlayerId, activeTeam]);

  // Id que usaremos para marcar el item (exacto o último conocido si aplica)
  const effectiveActiveId: string | null = exactActive
    ? (activePlayerId ? String(activePlayerId) : null)
    : lastActiveIdRef.current;

  // ¿No tenemos item a resaltar? entonces resaltamos el header del equipo
  const shouldHighlightHeader = (team: Team) =>
    !effectiveActiveId && !!activeTeam && activeTeam === team;

  const renderGroup = (team: Team, group: typeof snapshot.players) => {
    const teamColorHex = team === 'A' ? '#2e7d32' : '#0277bd';
    const teamMuiColor = team === 'A' ? 'success.main' : 'info.main';

    return (
      <Box key={team} sx={{ mb: 1.5 }}>
        <TeamHeader team={team} name={teamNames[team]} highlight={shouldHighlightHeader(team)} />
        <List dense sx={{ py: 0 }}>
          {group.map((pl) => {
            const isActive =
              !!effectiveActiveId && playerMatchesId(pl, effectiveActiveId);

            return (
              <ListItem
                key={pl.id}
                aria-current={isActive ? 'true' : undefined}
                secondaryAction={
                  isActive ? (
                    <Chip
                      size="small"
                      color={team === 'A' ? 'success' : 'info'}
                      label={`JUGANDO AHORA${(activePlayerName || pl.name) ? ` · ${activePlayerName || pl.name}` : ''}`}
                      sx={{ fontWeight: 800 }}
                    />
                  ) : undefined
                }
                sx={(theme) => ({
                  borderRadius: isActive ? 2 : 1.75,
                  mb: isActive ? 1 : 0.75,
                  border: isActive
                    ? `1.5px solid ${alpha(teamColorHex, 0.7)}`
                    : `1px solid ${alpha(theme.palette.divider, 0.6)}`,
                  background: isActive
                    ? `linear-gradient(135deg, ${alpha(teamColorHex, 0.18)}, ${alpha(teamColorHex, 0.07)})`
                    : alpha(theme.palette.background.paper, 0.6),
                  boxShadow: isActive
                    ? `0 0 0 2px ${alpha(teamColorHex, 0.12)} inset, 0 8px 24px ${alpha(teamColorHex, 0.22)}`
                    : 'none',
                  backdropFilter: 'blur(4px)',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::after': isActive
                    ? {
                        content: '""',
                        position: 'absolute',
                        inset: -2,
                        borderRadius: 18,
                        padding: 2,
                        background: `linear-gradient(135deg, ${alpha(teamColorHex, 0.6)}, ${alpha(teamColorHex, 0.1)}, ${alpha(teamColorHex, 0.6)})`,
                        WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
                        WebkitMaskComposite: 'xor',
                        maskComposite: 'exclude',
                        animation: 'pulseGlow 2.4s ease-in-out infinite',
                        pointerEvents: 'none',
                      }
                    : undefined,
                  '@keyframes pulseGlow': {
                    '0%, 100%': { opacity: 0.45 },
                    '50%': { opacity: 0.9 },
                  },
                })}
              >
                <ListItemAvatar>
                  <Tooltip title={isActive ? 'Jugador en turno' : 'Jugador'}>
                    <Avatar
                      sx={{
                        bgcolor: isActive ? alpha(teamColorHex, 0.15) : 'background.paper',
                        color: teamMuiColor,
                        border: isActive ? `2px solid ${teamColorHex}` : `1px solid`,
                        borderColor: isActive ? alpha(teamColorHex, 0.7) : 'divider',
                        fontWeight: 700,
                      }}
                    >
                      {TEAM_ICONS[team]}
                    </Avatar>
                  </Tooltip>
                </ListItemAvatar>

                <ListItemText
                  primary={pl.name || 'Jugador'}
                  secondary={String(pl.id ?? '').slice(0, 6)}
                  primaryTypographyProps={{
                    fontWeight: isActive ? 900 : 600,
                    sx: {
                      letterSpacing: 0.2,
                      color: isActive ? teamMuiColor : 'text.primary',
                    },
                  }}
                  secondaryTypographyProps={{
                    sx: { opacity: 0.6, fontFamily: 'monospace' },
                  }}
                />
              </ListItem>
            );
          })}
        </List>
      </Box>
    );
  };

  return (
    <Box>
      {renderGroup('A', playersA)}
      {renderGroup('B', playersB)}
    </Box>
  );
};

export default PlayersList;
