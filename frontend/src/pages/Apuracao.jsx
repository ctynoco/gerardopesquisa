import { useState, useEffect } from 'react'
import { Box, Typography, Card, CardContent, FormControl, InputLabel, Select, MenuItem, Button, Chip, Paper, Grid, Divider } from '@mui/material'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import RefreshIcon from '@mui/icons-material/Refresh'
import HowToVoteIcon from '@mui/icons-material/HowToVote'
import api from '../services/api'

const colors = ['#1976d2', '#d32f2f', '#2e7d32', '#ed6c02', '#9c27b0', '#00897b', '#546e7a', '#f9a825']

export default function Apuracao() {
  const [pesquisas, setPesquisas] = useState([])
  const [pesquisaId, setPesquisaId] = useState('')
  const [dados, setDados] = useState(null)
  const [autoRefresh, setAutoRefresh] = useState(true)

  useEffect(() => { api.get('/pesquisas?limit=100').then((r) => setPesquisas(r.data.pesquisas)) }, [])

  async function carregar() {
    if (!pesquisaId) return
    const r = await api.get(`/apuracao/${pesquisaId}`)
    setDados(r.data)
  }

  useEffect(() => { if (pesquisaId) carregar() }, [pesquisaId])
  useEffect(() => {
    if (!pesquisaId || !autoRefresh) return
    const id = setInterval(carregar, 20000)
    return () => clearInterval(id)
  }, [pesquisaId, autoRefresh])

  function maiorPct(respostas) {
    return Math.max(...respostas.map((r) => parseFloat(r.pct)), 0)
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1, mb: 2 }}>
        <Typography variant="h1" sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }}>Apuração ao Vivo</Typography>
        <Box>
          <Chip
            label={autoRefresh ? 'Auto 20s' : 'Pausado'}
            color={autoRefresh ? 'success' : 'default'}
            size="small"
            onClick={() => setAutoRefresh(!autoRefresh)}
            sx={{ cursor: 'pointer', mr: 1 }}
          />
          <Button size="small" variant="outlined" startIcon={<RefreshIcon />} onClick={carregar}>Atualizar</Button>
        </Box>
      </Box>

      <Card sx={{ mb: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
        <CardContent sx={{ p: { xs: 1.5, sm: 2 }, '&:last-child': { pb: { xs: 1.5, sm: 2 } } }}>
          <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 300 } }}>
            <InputLabel>Pesquisa</InputLabel>
            <Select value={pesquisaId} label="Pesquisa" onChange={(e) => setPesquisaId(e.target.value)}>
              {pesquisas.map((p) => <MenuItem key={p.id} value={p.id}>{p.titulo}</MenuItem>)}
            </Select>
          </FormControl>
        </CardContent>
      </Card>

      {dados && dados.map((pergunta) => {
        const maxPct = maiorPct(pergunta.respostas)
        return (
          <Card key={pergunta.pergunta_id} sx={{ mb: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <CardContent sx={{ p: { xs: 1.5, sm: 2 }, '&:last-child': { pb: { xs: 1.5, sm: 2 } } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Typography variant="body2" fontWeight={600}>{pergunta.titulo}</Typography>
                <Chip icon={<HowToVoteIcon />} label={`${pergunta.total} votos`} size="small" variant="outlined" />
              </Box>

              {pergunta.respostas.map((r, i) => {
                const pct = parseFloat(r.pct)
                const isLeader = pct === maxPct && pct > 0
                return (
                  <Box key={i} sx={{ mb: 1.5, '&:last-child': { mb: 0 } }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.25 }}>
                      <Typography variant="body2" fontWeight={isLeader ? 700 : 400}>
                        {r.label}
                        {isLeader && <Chip label="Líder" size="small" color="primary" sx={{ ml: 0.75, height: 18, fontSize: '0.6rem' }} />}
                      </Typography>
                      <Typography variant="body2" fontWeight={700} color={isLeader ? 'primary.main' : 'text.primary'}>
                        {r.pct}% <Typography component="span" variant="caption" color="text.secondary">({r.votos})</Typography>
                      </Typography>
                    </Box>
                    <Box sx={{ width: '100%', bgcolor: 'action.hover', borderRadius: 1, height: 22, position: 'relative', overflow: 'hidden' }}>
                      <Box sx={{ width: `${Math.max(pct, 1)}%`, height: '100%', bgcolor: colors[i % colors.length], borderRadius: 1, transition: 'width 0.5s ease' }} />
                    </Box>
                  </Box>
                )
              })}
            </CardContent>
          </Card>
        )
      })}

      {dados && !dados.length && (
        <Paper elevation={0} sx={{ p: 4, textAlign: 'center', border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
          <Typography color="text.secondary">Nenhuma pergunta encontrada nesta pesquisa</Typography>
        </Paper>
      )}
    </Box>
  )
}
