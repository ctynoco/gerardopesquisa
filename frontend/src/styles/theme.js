import { createTheme } from '@mui/material/styles'

const light = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#2563eb', light: '#60a5fa', dark: '#1d4ed8' },
    secondary: { main: '#6366f1' },
    background: { default: '#f1f5f9', paper: '#ffffff' },
    text: { primary: '#1e293b', secondary: '#64748b' },
    divider: '#e2e8f0',
    sidebar: '#1e293b',
  },
  shape: { borderRadius: 8 },
  typography: {
    fontFamily: '"Inter", "Segoe UI", system-ui, -apple-system, sans-serif',
    h1: { fontSize: '1.75rem', fontWeight: 600 },
    h2: { fontSize: '1.25rem', fontWeight: 600 },
    h3: { fontSize: '1.1rem', fontWeight: 500 },
    body1: { fontSize: '0.9rem' },
    body2: { fontSize: '0.8rem' },
  },
  components: {
    MuiDrawer: { styleOverrides: { paper: { backgroundColor: '#1e293b', color: '#cbd5e1', border: 'none' } } },
    MuiCard: { styleOverrides: { root: { border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' } } },
    MuiButton: { styleOverrides: { root: { textTransform: 'none', fontWeight: 500 } } },
    MuiTableHead: { styleOverrides: { root: { '& .MuiTableCell-head': { fontWeight: 600, backgroundColor: '#f8fafc' } } } },
  },
})

const dark = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#60a5fa', light: '#93c5fd', dark: '#2563eb' },
    secondary: { main: '#818cf8' },
    background: { default: '#0f172a', paper: '#1e293b' },
    text: { primary: '#f1f5f9', secondary: '#94a3b8' },
    divider: '#334155',
    sidebar: '#0f172a',
  },
  shape: { borderRadius: 8 },
  typography: {
    fontFamily: '"Inter", "Segoe UI", system-ui, -apple-system, sans-serif',
    h1: { fontSize: '1.75rem', fontWeight: 600 },
    h2: { fontSize: '1.25rem', fontWeight: 600 },
    h3: { fontSize: '1.1rem', fontWeight: 500 },
    body1: { fontSize: '0.9rem' },
    body2: { fontSize: '0.8rem' },
  },
  components: {
    MuiDrawer: { styleOverrides: { paper: { backgroundColor: '#0f172a', color: '#94a3b8', borderRight: '1px solid #1e293b' } } },
    MuiCard: { styleOverrides: { root: { border: '1px solid #334155', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' } } },
    MuiButton: { styleOverrides: { root: { textTransform: 'none', fontWeight: 500 } } },
    MuiTableHead: { styleOverrides: { root: { '& .MuiTableCell-head': { fontWeight: 600, backgroundColor: '#1e293b' } } } },
  },
})

export { light, dark }
