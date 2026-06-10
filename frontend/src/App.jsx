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

function Sidebar({ links, usuario, logout }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>Pesquisa Eleitoral</h2>
        <p>Sistema de Coleta</p>
      </div>
      <nav className="sidebar-nav">
        {links.map((l) => (
          <NavLink key={l.to} to={l.to} end={l.to === '/'}>{l.label}</NavLink>
        ))}
      </nav>
      <div className="sidebar-footer">
        <span style={{ fontSize: 12, color: '#94a3b8', display: 'block', marginBottom: 8 }}>
          {usuario.nome} ({usuario.perfil})
        </span>
        <button onClick={logout}>Sair</button>
      </div>
    </aside>
  )
}

function AdminLayout() {
  const { usuario, loading, logout } = useAuth()

  if (loading) return <div className="login-container"><p>Carregando...</p></div>
  if (!usuario) return <Navigate to="/login" replace />

  return (
    <div className="layout">
      <Sidebar
        usuario={usuario}
        logout={logout}
        links={[
          { to: '/', label: 'Dashboard' },
          { to: '/pesquisas', label: 'Pesquisas' },
          { to: '/perguntas', label: 'Perguntas' },
          { to: '/coleta', label: 'Coleta' },
          { to: '/relatorios', label: 'Relatórios' },
          { to: '/mapa', label: 'Mapa' },
          { to: '/admin', label: 'Admin' },
        ]}
      />
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

function PesquisadorLayout() {
  const { usuario, loading, logout } = useAuth()

  if (loading) return <div className="login-container"><p>Carregando...</p></div>
  if (!usuario) return <Navigate to="/login" replace />

  return (
    <div className="layout">
      <Sidebar
        usuario={usuario}
        logout={logout}
        links={[
          { to: '/coleta', label: 'Coleta' },
        ]}
      />
      <div className="main-content">
        <header className="header">
          <span className="header-user">{usuario.nome} - {usuario.perfil}</span>
        </header>
        <main className="content">
          <Routes>
            <Route path="/*" element={<Coleta />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

function ProtectedRoute() {
  const { usuario, loading } = useAuth()

  if (loading) return <div className="login-container"><p>Carregando...</p></div>
  if (!usuario) return <Navigate to="/login" replace />

  if (usuario.perfil === 'entrevistador') return <PesquisadorLayout />
  return <AdminLayout />
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/*" element={<ProtectedRoute />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
