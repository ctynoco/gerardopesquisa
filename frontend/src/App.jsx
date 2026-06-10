import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Pesquisas from './pages/Pesquisas'
import Perguntas from './pages/Perguntas'
import Coleta from './pages/Coleta'
import Relatorios from './pages/Relatorios'
import Mapa from './pages/Mapa'
import Admin from './pages/Admin'

function ProtectedLayout() {
  const { usuario, loading, logout } = useAuth()

  if (loading) return <div className="login-container"><p>Carregando...</p></div>
  if (!usuario) return <Navigate to="/login" replace />

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>Pesquisa Eleitoral</h2>
          <p>Sistema de Coleta</p>
        </div>
        <nav className="sidebar-nav">
          <NavLink to="/" end>Dashboard</NavLink>
          <NavLink to="/pesquisas">Pesquisas</NavLink>
          <NavLink to="/perguntas">Perguntas</NavLink>
          <NavLink to="/coleta">Coleta</NavLink>
          <NavLink to="/relatorios">Relatórios</NavLink>
          <NavLink to="/mapa">Mapa</NavLink>
          <NavLink to="/admin">Admin</NavLink>
        </nav>
        <div className="sidebar-footer">
          <span style={{ fontSize: 12, color: '#94a3b8', display: 'block', marginBottom: 8 }}>
            {usuario.nome} ({usuario.perfil})
          </span>
          <button onClick={logout}>Sair</button>
        </div>
      </aside>
      <div className="main-content">
        <header className="header">
          <span className="header-user">{usuario.nome} - {usuario.perfil}</span>
        </header>
        <main className="content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/pesquisas" element={<Pesquisas />} />
            <Route path="/perguntas" element={<Perguntas />} />
            <Route path="/coleta" element={<Coleta />} />
            <Route path="/relatorios" element={<Relatorios />} />
            <Route path="/mapa" element={<Mapa />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/*" element={<ProtectedLayout />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
