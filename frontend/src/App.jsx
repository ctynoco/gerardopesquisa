import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom'
import { Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText, AppBar, Toolbar, Typography, IconButton, Avatar, Menu, MenuItem, Divider, useMediaQuery } from '@mui/material'
import { useState } from 'react'
import DashboardIcon from '@mui/icons-material/Dashboard'
import QuizIcon from '@mui/icons-material/Quiz'

import HowToVoteIcon from '@mui/icons-material/HowToVote'
import BarChartIcon from '@mui/icons-material/BarChart'
import TableChartIcon from '@mui/icons-material/TableChart'
import MapIcon from '@mui/icons-material/Map'
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import LightModeIcon from '@mui/icons-material/LightMode'
import LogoutIcon from '@mui/icons-material/Logout'
import PollIcon from '@mui/icons-material/Poll'
import TrackChangesIcon from '@mui/icons-material/TrackChanges'
import MenuIcon from '@mui/icons-material/Menu'
import CloseIcon from '@mui/icons-material/Close'
import MergeTypeIcon from '@mui/icons-material/MergeType'
import AssignmentIcon from '@mui/icons-material/Assignment'
import VisibilityIcon from '@mui/icons-material/Visibility'
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted'
import HelpOutlineIcon from '@mui/icons-material/HelpOutlined'
import RoomIcon from '@mui/icons-material/Room'
import MenuBookIcon from '@mui/icons-material/MenuBook'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ThemeProvider, useTheme } from './contexts/ThemeContext'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Questionario from './pages/Questionario'

import Coleta from './pages/Coleta'
import Tabulacao from './pages/Tabulacao'
import Cruzamentos from './pages/Cruzamentos'
import Relatorios from './pages/Relatorios'
import Georreferenciamento from './pages/Georreferenciamento'
import Supervisao from './pages/Supervisao'
import Producao from './pages/Producao'
import Apuracao from './pages/Apuracao'
import Cotas from './pages/Cotas'
import Admin from './pages/Admin'
import Pesquisas from './pages/Pesquisas'
import Perguntas from './pages/Perguntas'
import Mapa from './pages/Mapa'
import Biblioteca from './pages/Biblioteca'

const DRAWER_W = 260

const icons = {
  Dashboard: <DashboardIcon />,
  'Criar Questionário': <QuizIcon />,
  Coleta: <HowToVoteIcon />,
  Tabulação: <TableChartIcon />,
  Cruzamentos: <MergeTypeIcon />,
  Cotas: <TrackChangesIcon />,
  Supervisão: <VisibilityIcon />,
  Produção: <AssignmentIcon />,
  Apuração: <PollIcon />,
  Mapa: <MapIcon />,
  Relatórios: <BarChartIcon />,
  Admin: <AdminPanelSettingsIcon />,
  Pesquisas: <FormatListBulletedIcon />,
  Perguntas: <HelpOutlineIcon />,
  'Mapa Detalhado': <RoomIcon />,
  Biblioteca: <MenuBookIcon />,
}

function SidebarContent({ links, usuario, logout, onClose }) {
  const { theme, toggle } = useTheme()
  const [anchor, setAnchor] = useState(null)

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 1.5, borderBottom: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
        <PollIcon sx={{ color: '#60a5fa', fontSize: 28 }} />
        <Box sx={{ flex: 1 }}>
          <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: 15, lineHeight: 1.2 }}>Instituto</Typography>
          <Typography sx={{ color: '#60a5fa', fontSize: 11, fontWeight: 500, letterSpacing: '0.02em' }}>PESQUISA ELEITORAL</Typography>
        </Box>
        {onClose && (
          <IconButton size="small" onClick={onClose} sx={{ color: '#64748b' }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        )}
      </Box>

      <List sx={{ flex: 1, pt: 1 }}>
        {links.map((l) => (
          <ListItemButton
            key={l.to}
            component={NavLink}
            to={l.to}
            end={l.to === '/'}
            onClick={onClose}
            sx={{
              mx: 1, borderRadius: 1, mb: 0.25, py: 1.2,
              color: '#94a3b8', '&:hover': { backgroundColor: 'rgba(255,255,255,0.08)', color: '#fff' },
              '&.active': { backgroundColor: 'rgba(37,99,235,0.15)', color: '#60a5fa', '& .MuiListItemIcon-root': { color: '#60a5fa' } },
            }}
          >
            <ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}>{icons[l.label]}</ListItemIcon>
            <ListItemText primary={l.label} primaryTypographyProps={{ fontSize: 14, fontWeight: 500 }} />
          </ListItemButton>
        ))}
      </List>

      <Box sx={{ p: 2, borderTop: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar sx={{ width: 34, height: 34, bgcolor: '#2563eb', fontSize: 14, fontWeight: 700 }}>
            {usuario.nome.charAt(0).toUpperCase()}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ color: '#e2e8f0', fontSize: 13, fontWeight: 600, lineHeight: 1.2 }}>{usuario.nome}</Typography>
            <Typography sx={{ color: '#64748b', fontSize: 11, textTransform: 'capitalize' }}>{usuario.perfil}</Typography>
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
    </Box>
  )
}

function Layout({ links }) {
  const { usuario, loading, logout } = useAuth()
  const isMobile = useMediaQuery('(max-width:899px)')
  const [mobileOpen, setMobileOpen] = useState(false)

  if (loading) return <Box sx={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default' }}><Typography color="text.secondary">Carregando...</Typography></Box>
  if (!usuario) return <Navigate to="/login" replace />

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {isMobile ? (
        <Drawer variant="temporary" open={mobileOpen} onClose={() => setMobileOpen(false)} ModalProps={{ keepMounted: true }} sx={{ '& .MuiDrawer-paper': { width: DRAWER_W, boxSizing: 'border-box' } }}>
          <SidebarContent links={links} usuario={usuario} logout={logout} onClose={() => setMobileOpen(false)} />
        </Drawer>
      ) : (
        <Drawer variant="permanent" sx={{ width: DRAWER_W, flexShrink: 0, '& .MuiDrawer-paper': { width: DRAWER_W, boxSizing: 'border-box' } }}>
          <SidebarContent links={links} usuario={usuario} logout={logout} />
        </Drawer>
      )}

      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <AppBar position="sticky" color="inherit" elevation={0} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Toolbar variant="dense" sx={{ gap: 1, minHeight: { xs: 48, sm: 52 } }}>
            {isMobile && <IconButton edge="start" onClick={() => setMobileOpen(true)} sx={{ mr: 1 }}><MenuIcon /></IconButton>}
            <Box sx={{ flex: 1 }} />
            <Typography variant="body2" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>{usuario.nome} &mdash; {usuario.perfil}</Typography>
          </Toolbar>
        </AppBar>
        <Box sx={{ flex: 1, p: { xs: 1.5, sm: 2, md: 3 }, overflow: 'auto', backgroundColor: 'background.default' }}>
          <Routes>
            {links.map((l) => <Route key={l.to} path={l.to === '/' ? '/' : l.to} element={l.element} />)}
            <Route path="*" element={<Navigate to={links[0].to} replace />} />
          </Routes>
        </Box>
      </Box>
    </Box>
  )
}

function AdminLayout() {
  return (
    <Layout links={[
      { to: '/', label: 'Dashboard', element: <Dashboard /> },
      { to: '/questionario', label: 'Criar Questionário', element: <Questionario /> },
      { to: '/coleta', label: 'Coleta', element: <Coleta /> },
      { to: '/tabulacao', label: 'Tabulação', element: <Tabulacao /> },
      { to: '/cruzamentos', label: 'Cruzamentos', element: <Cruzamentos /> },
      { to: '/cotas', label: 'Cotas', element: <Cotas /> },
      { to: '/supervisao', label: 'Supervisão', element: <Supervisao /> },
      { to: '/producao', label: 'Produção', element: <Producao /> },
      { to: '/apuracao', label: 'Apuração', element: <Apuracao /> },
      { to: '/georreferenciamento', label: 'Mapa', element: <Georreferenciamento /> },
      { to: '/relatorios', label: 'Relatórios', element: <Relatorios /> },
      { to: '/admin', label: 'Admin', element: <Admin /> },
      { to: '/pesquisas', label: 'Pesquisas', element: <Pesquisas /> },
      { to: '/perguntas', label: 'Perguntas', element: <Perguntas /> },
      { to: '/mapa', label: 'Mapa Detalhado', element: <Mapa /> },
      { to: '/biblioteca', label: 'Biblioteca', element: <Biblioteca /> },
    ]} />
  )
}

function PesquisadorLayout() {
  return <Layout links={[{ to: '/coleta', label: 'Coleta', element: <Coleta /> }]} />
}

function ProtectedRoute() {
  const { usuario, loading } = useAuth()
  if (loading) return <Box sx={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default' }}><Typography color="text.secondary">Carregando...</Typography></Box>
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
