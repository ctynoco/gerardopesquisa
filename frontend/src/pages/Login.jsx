import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Card, CardContent, Typography, TextField, Button, Box, Alert, CircularProgress } from '@mui/material'
import PollIcon from '@mui/icons-material/Poll'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/api'

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
    <Box sx={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 50%, #1e293b 100%)' }}>
      <Card sx={{ width: '100%', maxWidth: 400, mx: 2, p: 1 }}>
        <CardContent sx={{ textAlign: 'center', py: 4 }}>
          <PollIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
          <Typography variant="h1" sx={{ mb: 0.5 }}>Pesquisa Eleitoral</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Sistema de Coleta e Análise</Typography>

          {erro && <Alert severity="error" sx={{ mb: 2, textAlign: 'left' }}>{erro}</Alert>}
          {sucesso && <Alert severity="success" sx={{ mb: 2, textAlign: 'left' }}>{sucesso}</Alert>}

          {modo === 'entrar' ? (
            <Box component="form" onSubmit={handleLogin} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField label="Telefone" type="tel" value={telefone} onChange={(e) => setTelefone(e.target.value)} required fullWidth size="small" />
              <TextField label="Senha" type="password" value={senha} onChange={(e) => setSenha(e.target.value)} required fullWidth size="small" />
              <Button type="submit" variant="contained" disabled={loading} fullWidth sx={{ py: 1.2 }}>
                {loading ? <CircularProgress size={20} sx={{ color: 'white' }} /> : 'Entrar'}
              </Button>
            </Box>
          ) : (
            <Box component="form" onSubmit={handleCadastro} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField label="Nome completo" value={nome} onChange={(e) => setNome(e.target.value)} required fullWidth size="small" />
              <TextField label="Telefone" type="tel" value={telefone} onChange={(e) => setTelefone(e.target.value)} required fullWidth size="small" />
              <TextField label="Senha" type="password" value={senha} onChange={(e) => setSenha(e.target.value)} required fullWidth size="small" />
              <Button type="submit" variant="contained" fullWidth sx={{ py: 1.2 }}>Cadastrar</Button>
            </Box>
          )}

          <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
            {modo === 'entrar' ? (
              <>Ainda não tem conta?{' '}</>
            ) : (
              <>Já tem conta?{' '}</>
            )}
            <Button
              size="small"
              sx={{ textTransform: 'none', textDecoration: 'underline', minWidth: 0, p: 0, verticalAlign: 'baseline', fontSize: 'inherit' }}
              onClick={() => { setModo(modo === 'entrar' ? 'cadastrar' : 'entrar'); setErro(''); setSucesso('') }}
            >
              {modo === 'entrar' ? 'Cadastre-se' : 'Faça login'}
            </Button>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  )
}
