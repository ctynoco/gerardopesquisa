import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/api'
import '../styles/login.css'

export default function Login() {
  const { login } = useAuth()
  const [aba, setAba] = useState('entrar')
  const [telefone, setTelefone] = useState('')
  const [senha, setSenha] = useState('')
  const [nome, setNome] = useState('')
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')

  async function handleLogin(e) {
    e.preventDefault()
    try {
      setErro('')
      await login(telefone, senha)
    } catch {
      setErro('Credenciais inválidas')
    }
  }

  async function handleCadastro(e) {
    e.preventDefault()
    try {
      setErro('')
      await api.post('/auth/register', { nome, telefone, senha })
      setSucesso('Cadastro realizado! Faça login.')
      setAba('entrar')
      setNome('')
      setSenha('')
    } catch (err) {
      setErro(err.response?.data?.error || 'Erro ao cadastrar')
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Pesquisa Eleitoral</h1>
        <p className="login-subtitle">Sistema de Coleta e Análise</p>

        <div style={{ display: 'flex', marginBottom: 20, gap: 0 }}>
          <button
            className={`btn ${aba === 'entrar' ? 'btn-primary' : ''}`}
            style={{ flex: 1, borderRadius: '6px 0 0 6px' }}
            onClick={() => { setAba('entrar'); setErro(''); setSucesso('') }}
          >
            Entrar
          </button>
          <button
            className={`btn ${aba === 'cadastrar' ? 'btn-primary' : ''}`}
            style={{ flex: 1, borderRadius: '0 6px 6px 0' }}
            onClick={() => { setAba('cadastrar'); setErro(''); setSucesso('') }}
          >
            Cadastrar
          </button>
        </div>

        {erro && <p className="login-erro">{erro}</p>}
        {sucesso && <p style={{ color: '#16a34a', fontSize: 14, marginBottom: 16 }}>{sucesso}</p>}

        {aba === 'entrar' ? (
          <form onSubmit={handleLogin}>
            <input
              type="tel" placeholder="Telefone" value={telefone}
              onChange={(e) => setTelefone(e.target.value)} required
            />
            <input
              type="password" placeholder="Senha" value={senha}
              onChange={(e) => setSenha(e.target.value)} required
            />
            <button type="submit">Entrar</button>
          </form>
        ) : (
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
        )}
      </div>
    </div>
  )
}
