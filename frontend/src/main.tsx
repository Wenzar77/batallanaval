// =========================
// File: src/main.tsx
// =========================
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material'
import './index.css';
import { SoundProvider } from './sound/SoundProvider';

const theme = createTheme({
  palette: { mode: 'light', primary: { main: '#2e7d32' }, secondary: { main: '#0277bd' } },
  shape: { borderRadius: 12 },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SoundProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    </SoundProvider>
  </React.StrictMode>
)