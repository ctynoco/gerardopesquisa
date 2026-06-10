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
      if (err.response?.data?.error) setErro(err.response.data.error)
      else if (err.code === 'ERR_NETWORK' || err.message?.includes('Network Error')) setErro('Servidor indisponível. Tente novamente em instantes.')
      else setErro('Erro ao conectar. Verifique sua conexão.')
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
    <Box sx={{
      display: 'flex', minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #1e3a8a 100%)',
      alignItems: 'center', justifyContent: 'center', p: 2,
    }}>
      <Card sx={{ width: '100%', maxWidth: 380, position: 'relative', overflow: 'visible' }}>
        <Box sx={{
          width: 64, height: 64, borderRadius: '50%', bgcolor: '#1d4ed8',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'absolute', top: -32, left: '50%', transform: 'translateX(-50%)',
          boxShadow: '0 4px 14px rgba(29,78,216,0.4)',
        }}>
          <PollIcon sx={{ fontSize: 32, color: '#fff' }} />
        </Box>
        <CardContent sx={{ textAlign: 'center', pt: 5, pb: 3, px: 3 }}>
          <Typography variant="h1" sx={{ fontSize: '1.3rem', mb: 0.25 }}>
            {modo === 'entrar' ? 'Entrar' : 'Cadastrar'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {modo === 'entrar' ? 'Sistema de Coleta e Análise' : 'Crie sua conta para acessar'}
          </Typography>

          {erro && <Alert severity="error" sx={{ mb: 2, textAlign: 'left' }}>{erro}</Alert>}
          {sucesso && <Alert severity="success" sx={{ mb: 2, textAlign: 'left' }}>{sucesso}</Alert>}

          {modo === 'entrar' ? (
            <Box component="form" onSubmit={handleLogin} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField label="Telefone" type="tel" value={telefone} onChange={(e) => setTelefone(e.target.value)} required fullWidth size="small" />
              <TextField label="Senha" type="password" value={senha} onChange={(e) => setSenha(e.target.value)} required fullWidth size="small" />
              <Button type="submit" variant="contained" disabled={loading} fullWidth sx={{ py: 1.3 }}>
                {loading ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : 'Entrar'}
              </Button>
            </Box>
          ) : (
            <Box component="form" onSubmit={handleCadastro} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField label="Nome completo" value={nome} onChange={(e) => setNome(e.target.value)} required fullWidth size="small" />
              <TextField label="Telefone" type="tel" value={telefone} onChange={(e) => setTelefone(e.target.value)} required fullWidth size="small" />
              <TextField label="Senha" type="password" value={senha} onChange={(e) => setSenha(e.target.value)} required fullWidth size="small" />
              <Button type="submit" variant="contained" fullWidth sx={{ py: 1.3 }}>Cadastrar</Button>
            </Box>
          )}

          <Typography variant="body2" color="text.secondary" sx={{ mt: 2.5 }}>
            {modo === 'entrar' ? 'Ainda não tem conta? ' : 'Já tem conta? '}
            <Button
              size="small"
              sx={{ textTransform: 'none', textDecoration: 'underline', minWidth: 0, p: 0, verticalAlign: 'baseline', fontSize: 'inherit', fontWeight: 600 }}
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
