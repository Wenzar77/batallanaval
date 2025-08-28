// src/components/PlayersList.tsx
import React, { useMemo } from 'react';
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

const PlayersList: React.FC<Props> = ({ snapshot }) => {
  const turnId = snapshot.turnPlayerId ?? null;
  const turnTeam = snapshot.turnTeam ?? null;

  const playersA = snapshot.players.filter((p) => p.team === 'A');
  const playersB = snapshot.players.filter((p) => p.team === 'B');

  // Jugador activo robusto: por id, luego clientId, luego nombre (si el server lo manda)
  const activePlayer = useMemo(() => {
    if (!turnId) return null;
    const target = String(turnId);
    const byId =
      snapshot.players.find((p: any) => String(p.id) === target) ??
      snapshot.players.find((p: any) => p.clientId && String(p.clientId) === target);
    if (byId) return byId;
    const possibleName = (snapshot as any).turnPlayerName as string | undefined;
    if (possibleName) {
      return snapshot.players.find((p) => (p.name ?? '').trim() === possibleName.trim()) ?? null;
    }
    return null;
  }, [snapshot.players, turnId, snapshot]);

  const teamNames = snapshot.teamNames;

  const renderGroup = (team: Team, group: typeof snapshot.players) => {
    const teamColor = team === 'A' ? '#2e7d32' : '#0277bd';
    const teamMUIColor = team === 'A' ? 'success.main' : 'info.main';
    const highlightTeamHeader = !activePlayer && !!turnTeam && turnTeam === team;

    return (
      <Box key={team} sx={{ mb: 1.5 }}>
        <TeamHeader team={team} name={teamNames[team]} highlight={highlightTeamHeader} />
        <List dense sx={{ py: 0 }}>
          {group.map((p) => {
            const isActive = !!activePlayer && p.id === activePlayer.id;
            return (
              <ListItem
                key={p.id}
                aria-current={isActive ? 'true' : undefined}
                secondaryAction={
                  isActive ? (
                    <Chip
                      size="small"
                      color={team === 'A' ? 'success' : 'info'}
                      label={`En turno${p.name ? ` · ${p.name}` : ''}`}
                      sx={{ fontWeight: 700 }}
                    />
                  ) : undefined
                }
                sx={(theme) => ({
                  borderRadius: isActive ? 2 : 1.75,
                  mb: isActive ? 1 : 0.75,
                  border: isActive ? `1.5px solid ${alpha(teamColor, 0.7)}` : `1px solid ${alpha(theme.palette.divider, 0.6)}`,
                  background: isActive
                    ? `linear-gradient(135deg, ${alpha(teamColor, 0.16)}, ${alpha(teamColor, 0.06)})`
                    : alpha(theme.palette.background.paper, 0.6),
                  boxShadow: isActive
                    ? `0 0 0 2px ${alpha(teamColor, 0.12)} inset, 0 8px 24px ${alpha(teamColor, 0.22)}`
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
                        background: `linear-gradient(135deg, ${alpha(teamColor, 0.6)}, ${alpha(teamColor, 0.1)}, ${alpha(teamColor, 0.6)})`,
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
                        bgcolor: isActive ? alpha(teamColor, 0.15) : 'background.paper',
                        color: teamMUIColor,
                        border: isActive ? `2px solid ${teamColor}` : `1px solid`,
                        borderColor: isActive ? alpha(teamColor, 0.7) : 'divider',
                        fontWeight: 700,
                      }}
                    >
                      {TEAM_ICONS[team]}
                    </Avatar>
                  </Tooltip>
                </ListItemAvatar>

                <ListItemText
                  primary={p.name || 'Jugador'}
                  secondary={String(p.id ?? '').slice(0, 6)}
                  primaryTypographyProps={{
                    fontWeight: isActive ? 800 : 600,
                    sx: {
                      letterSpacing: 0.2,
                      color: isActive ? teamMUIColor : 'text.primary',
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
