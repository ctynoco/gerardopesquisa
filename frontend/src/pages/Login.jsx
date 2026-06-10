import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import '../styles/login.css'

export default function Login() {
  const { login } = useAuth()
  const [telefone, setTelefone] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    try {
      setErro('')
      await login(telefone, senha)
    } catch {
      setErro('Credenciais inválidas')
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Pesquisa Eleitoral</h1>
        <p className="login-subtitle">Sistema de Coleta e Análise</p>
        {erro && <p className="login-erro">{erro}</p>}
        <form onSubmit={handleSubmit}>
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
      </div>
    </div>
  )
}
