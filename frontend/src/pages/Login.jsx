import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/api'
import '../styles/login.css'

export default function Login() {
  const { login, usuario } = useAuth()

  if (usuario) {
    return <Navigate to={usuario.perfil === 'entrevistador' ? '/coleta' : '/'} replace />
  }
  const [modo, setModo] = useState('entrar')
  const [telefone, setTelefone] = useState('')
  const [senha, setSenha] = useState('')
  const [nome, setNome] = useState('')
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true)
    setErro('')
    try {
      await login(telefone, senha)
    } catch (err) {
      if (err.response?.data?.error) {
        setErro(err.response.data.error)
      } else if (err.code === 'ERR_NETWORK' || err.message?.includes('Network Error')) {
        setErro('Servidor indisponível. Tente novamente em instantes.')
      } else {
        setErro('Erro ao conectar. Verifique sua conexão.')
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleCadastro(e) {
    e.preventDefault()
    try {
      setErro('')
      await api.post('/auth/register', { nome, telefone, senha })
      setSucesso('Cadastro realizado! Faça login.')
      setModo('entrar')
      setNome('')
      setSenha('')
      setTelefone('')
    } catch (err) {
      setErro(err.response?.data?.error || 'Erro ao cadastrar')
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Pesquisa Eleitoral</h1>
        <p className="login-subtitle">Sistema de Coleta e Análise</p>

        {erro && <p className="login-erro">{erro}</p>}
        {sucesso && <p style={{ color: '#16a34a', fontSize: 14, marginBottom: 16 }}>{sucesso}</p>}

        {modo === 'entrar' ? (
          <>
            <form onSubmit={handleLogin}>
              <input
                type="tel" placeholder="Telefone" value={telefone}
                onChange={(e) => setTelefone(e.target.value)} required
              />
              <input
                type="password" placeholder="Senha" value={senha}
                onChange={(e) => setSenha(e.target.value)} required
              />
              <button type="submit" disabled={loading}>{loading ? 'Entrando...' : 'Entrar'}</button>
            </form>
            <p style={{ marginTop: 16, fontSize: 13, color: '#94a3b8' }}>
              Ainda não tem conta?{' '}
              <button
                className="link-btn"
                onClick={() => { setModo('cadastrar'); setErro(''); setSucesso('') }}
              >
                Cadastre-se
              </button>
            </p>
          </>
        ) : (
          <>
            <form onSubmit={handleCadastro}>
              <input
                type="text" placeholder="Nome completo" value={nome}
                onChange={(e) => setNome(e.target.value)} required
              />
              <input
                type="tel" placeholder="Telefone" value={telefone}
                onChange={(e) => setTelefone(e.target.value)} required
              />
              <input
                type="password" placeholder="Senha" value={senha}
                onChange={(e) => setSenha(e.target.value)} required
              />
              <button type="submit">Cadastrar</button>
            </form>
            <p style={{ marginTop: 16, fontSize: 13, color: '#94a3b8' }}>
              Já tem conta?{' '}
              <button
                className="link-btn"
                onClick={() => { setModo('entrar'); setErro(''); setSucesso('') }}
              >
                Faça login
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
