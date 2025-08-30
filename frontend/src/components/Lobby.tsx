import React from 'react';
import { Grid, Stack, TextField, Button, Divider, Avatar, FormControl, Select, MenuItem, FormControlLabel, Switch, Typography } from '@mui/material';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import type { Team } from '../types/game';

const Lobby: React.FC<{
  name: string; setName: (s: string) => void;
  team: Team; setTeam: (t: Team) => void;
  mode: 'crear' | 'unirme'; setMode: (m: 'crear' | 'unirme') => void;
  code: string; setCode: (s: string) => void;
  teamNames: Record<Team, string>;
  isHost: boolean;
  onCreate: () => void; onStart: () => void; onJoin: () => void;
}> = ({ name, setName, team, setTeam, mode, setMode, code, setCode, teamNames, isHost, onCreate, onStart, onJoin }) => (
  <>
    <Typography variant="h4" sx={{ textAlign: 'center' }}>Inicia la Batalla</Typography>
    <Grid container spacing={1} alignItems="center">
      <Grid xs={12} md={3}>
        <FormControl fullWidth margin="normal" size="small">
          <TextField
            fullWidth
            label="Tu nombre"
            value={name}
            onChange={(e) => setName(e.target.value)}
            size="small"
            sx={{ backgroundColor: "white", borderRadius: 1 }}
          />
        </FormControl>

        <FormControl fullWidth margin="normal" size="small" sx={{ backgroundColor: "white", borderRadius: 1 }}>
          <Select
            value={team}
            onChange={(e) => setTeam(e.target.value as Team)}
          >
            <MenuItem value="A">
              <Stack direction="row" alignItems="center" spacing={1}>
                <Avatar sx={{ width: 20, height: 20, fontSize: 14 }}>🐆</Avatar>
                <span>{teamNames.A}</span>
              </Stack>
            </MenuItem>
            <MenuItem value="B">
              <Stack direction="row" alignItems="center" spacing={1}>
                <Avatar sx={{ width: 20, height: 20, fontSize: 14 }}>🦜</Avatar>
                <span>{teamNames.B}</span>
              </Stack>
            </MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid xs={12} md={3}>
        <FormControlLabel control={<Switch sx={{ m: 1 }} checked={mode === 'unirme'} onChange={(e) => setMode(e.target.checked ? 'unirme' : 'crear')} color="primary" />} label={mode === 'unirme' ? 'Unirme' : 'Crear sala'} />
      </Grid>
      <Grid xs={12} md={7}>
        {mode === 'crear' ? (
          <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ m: 1 }} spacing={1} alignItems={{ xs: 'stretch', sm: 'center' }}>
            <Button variant="contained" startIcon={<GroupAddIcon />} onClick={onCreate} fullWidth>Crear</Button>
            {code && (<TextField size="small" label="Código de sala" value={code} InputProps={{ readOnly: true }} sx={{ backgroundColor: "white", borderRadius: 1, textAlign: 'center', minWidth: '15vh', width: { xs: '100%', sm: 200 } }} />)}
            <Divider orientation={{ xs: 'horizontal', sm: 'vertical' } as any} flexItem sx={{ mx: { sm: 1 }, my: { xs: 1, sm: 0 } }} />
            <Button variant="contained" color="secondary" startIcon={<PlayArrowIcon />} onClick={onStart} disabled={!isHost} fullWidth>Iniciar</Button>
          </Stack>
        ) : (
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ xs: 'stretch', sm: 'center' }}>
            <TextField size="small" label="Código" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} sx={{ backgroundColor: "white", borderRadius: 1, textAlign: 'center', width: { xs: '100%', sm: 180 } }} />
            <Button variant="outlined" onClick={onJoin} fullWidth>Unirme</Button>
          </Stack>
        )}
      </Grid>
    </Grid>
  </>
);
export default Lobby;