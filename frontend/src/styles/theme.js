import { createTheme } from '@mui/material/styles'

const shared = {
  shape: { borderRadius: 10 },
  typography: {
    fontFamily: '"Inter", "Segoe UI", system-ui, -apple-system, sans-serif',
    h1: { fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.01em' },
    h2: { fontSize: '1.1rem', fontWeight: 600 },
    h3: { fontSize: '1rem', fontWeight: 600 },
    body1: { fontSize: '0.9rem', lineHeight: 1.6 },
    body2: { fontSize: '0.8rem', lineHeight: 1.5 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 10, padding: '10px 20px', textTransform: 'none', fontWeight: 600 },
        sizeSmall: { borderRadius: 8, padding: '6px 14px' },
      },
    },
    MuiCard: {
      styleOverrides: { root: { borderRadius: 12 } },
    },
    MuiPaper: {
      styleOverrides: { root: { borderRadius: 12 } },
    },
    MuiChip: {
      styleOverrides: { root: { borderRadius: 8 } },
    },
    MuiTextField: {
      styleOverrides: { root: { '& .MuiOutlinedInput-root': { borderRadius: 10 } } },
    },
    MuiSelect: {
      styleOverrides: { root: { borderRadius: 10 } },
    },
    MuiTableHead: {
      styleOverrides: { root: { '& .MuiTableCell-head': { fontWeight: 600 } } },
    },
  },
}

const light = createTheme({
  ...shared,
  palette: {
    mode: 'light',
    primary: { main: '#1d4ed8', light: '#3b82f6', dark: '#1e3a8a' },
    secondary: { main: '#64748b' },
    background: { default: '#f8fafc', paper: '#ffffff' },
    text: { primary: '#0f172a', secondary: '#64748b' },
    divider: '#e2e8f0',
  },
})

const dark = createTheme({
  ...shared,
  palette: {
    mode: 'dark',
    primary: { main: '#60a5fa', light: '#93c5fd', dark: '#2563eb' },
    secondary: { main: '#94a3b8' },
    background: { default: '#0f172a', paper: '#1e293b' },
    text: { primary: '#f1f5f9', secondary: '#94a3b8' },
    divider: '#334155',
  },
})

export { light, dark }
