import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom'
import { Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText, AppBar, Toolbar, Typography, IconButton, Button, Avatar, Menu, MenuItem, Divider } from '@mui/material'
import { useState } from 'react'
import DashboardIcon from '@mui/icons-material/Dashboard'
import AssessmentIcon from '@mui/icons-material/Assessment'
import QuizIcon from '@mui/icons-material/Quiz'
import HowToVoteIcon from '@mui/icons-material/HowToVote'
import BarChartIcon from '@mui/icons-material/BarChart'
import MapIcon from '@mui/icons-material/Map'
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import LightModeIcon from '@mui/icons-material/LightMode'
import LogoutIcon from '@mui/icons-material/Logout'
import PollIcon from '@mui/icons-material/Poll'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ThemeProvider, useTheme } from './contexts/ThemeContext'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Pesquisas from './pages/Pesquisas'
import Perguntas from './pages/Perguntas'
import Coleta from './pages/Coleta'
import Relatorios from './pages/Relatorios'
import Mapa from './pages/Mapa'
import Admin from './pages/Admin'

const DRAWER_W = 250

const icons = {
  Dashboard: <DashboardIcon />,
  Pesquisas: <AssessmentIcon />,
  Perguntas: <QuizIcon />,
  Coleta: <HowToVoteIcon />,
  Relatorios: <BarChartIcon />,
  Mapa: <MapIcon />,
  Admin: <AdminPanelSettingsIcon />,
}

function Sidebar({ links, usuario, logout }) {
  const { theme, toggle } = useTheme()
  const [anchor, setAnchor] = useState(null)

  return (
    <Drawer variant="permanent" sx={{ width: DRAWER_W, flexShrink: 0, '& .MuiDrawer-paper': { width: DRAWER_W, boxSizing: 'border-box' } }}>
      <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 1.5, borderBottom: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
        <PollIcon sx={{ color: '#60a5fa', fontSize: 28 }} />
        <Box>
          <Typography sx={{ color: '#fff', fontWeight: 600, fontSize: 15, lineHeight: 1.2 }}>Pesquisa Eleitoral</Typography>
          <Typography sx={{ color: '#64748b', fontSize: 11 }}>Sistema de Coleta</Typography>
        </Box>
      </Box>

      <List sx={{ flex: 1, pt: 1 }}>
        {links.map((l) => (
          <ListItemButton
            key={l.to}
            component={NavLink}
            to={l.to}
            end={l.to === '/'}
            sx={{
              mx: 1, borderRadius: 1, mb: 0.25,
              color: '#94a3b8', '&:hover': { backgroundColor: 'rgba(255,255,255,0.08)', color: '#fff' },
              '&.active': { backgroundColor: 'rgba(37,99,235,0.15)', color: '#60a5fa', '& .MuiListItemIcon-root': { color: '#60a5fa' } },
            }}
          >
            <ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}>{icons[l.label]}</ListItemIcon>
            <ListItemText primary={l.label} primaryTypographyProps={{ fontSize: 14 }} />
          </ListItemButton>
        ))}
      </List>

      <Box sx={{ p: 2, borderTop: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Avatar sx={{ width: 32, height: 32, bgcolor: '#2563eb', fontSize: 13, fontWeight: 600 }}>
            {usuario.nome.charAt(0).toUpperCase()}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ color: '#e2e8f0', fontSize: 13, fontWeight: 500, lineHeight: 1.2 }}>{usuario.nome}</Typography>
            <Typography sx={{ color: '#64748b', fontSize: 11 }}>{usuario.perfil}</Typography>
          </Box>
          <IconButton size="small" onClick={(e) => setAnchor(e.currentTarget)} sx={{ color: '#64748b' }}>
            <LogoutIcon fontSize="small" />
          </IconButton>
          <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)}>
            <MenuItem onClick={() => { toggle(); setAnchor(null) }}>
              <ListItemIcon>{theme === 'light' ? <DarkModeIcon fontSize="small" /> : <LightModeIcon fontSize="small" />}</ListItemIcon>
              {theme === 'light' ? 'Modo escuro' : 'Modo claro'}
            </MenuItem>
            <Divider />
            <MenuItem onClick={() => { logout(); setAnchor(null) }}>
              <ListItemIcon><LogoutIcon fontSize="small" /></ListItemIcon>
              Sair
            </MenuItem>
          </Menu>
        </Box>
      </Box>
    </Drawer>
  )
}

function Layout({ links }) {
  const { usuario, loading, logout } = useAuth()

  if (loading) return <Box sx={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}><Typography>Carregando...</Typography></Box>
  if (!usuario) return <Navigate to="/login" replace />

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar links={links} usuario={usuario} logout={logout} />
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <AppBar position="sticky" color="inherit" elevation={0} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Toolbar variant="dense" sx={{ justifyContent: 'flex-end', minHeight: 48 }}>
            <Typography variant="body2" color="text.secondary">
              {usuario.nome} &mdash; {usuario.perfil}
            </Typography>
          </Toolbar>
        </AppBar>
        <Box sx={{ flex: 1, p: 3, overflow: 'auto', backgroundColor: 'background.default' }}>
          <Routes>
            {links.map((l) => (
              <Route key={l.to} path={l.to === '/' ? '/' : l.to} element={l.element} />
            ))}
            <Route path="*" element={<Navigate to={links[0].to} replace />} />
          </Routes>
        </Box>
      </Box>
    </Box>
  )
}

function AdminLayout() {
  return (
    <Layout
      links={[
        { to: '/', label: 'Dashboard', element: <Dashboard /> },
        { to: '/pesquisas', label: 'Pesquisas', element: <Pesquisas /> },
        { to: '/perguntas', label: 'Perguntas', element: <Perguntas /> },
        { to: '/coleta', label: 'Coleta', element: <Coleta /> },
        { to: '/relatorios', label: 'Relatorios', element: <Relatorios /> },
        { to: '/mapa', label: 'Mapa', element: <Mapa /> },
        { to: '/admin', label: 'Admin', element: <Admin /> },
      ]}
    />
  )
}

function PesquisadorLayout() {
  return (
    <Layout
      links={[
        { to: '/coleta', label: 'Coleta', element: <Coleta /> },
      ]}
    />
  )
}

function ProtectedRoute() {
  const { usuario, loading } = useAuth()
  if (loading) return <Box sx={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}><Typography>Carregando...</Typography></Box>
  if (!usuario) return <Navigate to="/login" replace />
  if (usuario.perfil === 'entrevistador') return <PesquisadorLayout />
  return <AdminLayout />
}

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/*" element={<ProtectedRoute />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  )
}
