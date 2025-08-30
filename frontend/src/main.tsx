// =========================
// File: src/main.tsx
// =========================
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material'
import './index.css';

const theme = createTheme({
  palette: { mode: 'light', primary: { main: '#2e7d32' }, secondary: { main: '#0277bd' } },
  shape: { borderRadius: 12 },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </React.StrictMode>
)