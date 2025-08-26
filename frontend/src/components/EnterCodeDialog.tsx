import * as React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Stack
} from '@mui/material';

type Props = {
  open: boolean;
  initialCode?: string;
  onClose: () => void;
  onConfirm: (code: string) => void;
};

export default function EnterCodeDialog({ open, initialCode, onClose, onConfirm }: Props) {
  const [code, setCode] = React.useState(initialCode ?? '');

  React.useEffect(() => { setCode((initialCode ?? '').toUpperCase()); }, [initialCode, open]);

  const handleConfirm = () => {
    const c = code.trim().toUpperCase();
    if (!c) return;
    onConfirm(c);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Ver tablero</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Código de sala"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            autoFocus
            inputProps={{ maxLength: 8, style: { letterSpacing: 2, fontWeight: 700 } }}
            helperText="Ingresa el código (ej. ABCDE)"
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={handleConfirm}>Abrir</Button>
      </DialogActions>
    </Dialog>
  );
}
