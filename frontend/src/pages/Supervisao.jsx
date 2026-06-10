import { useState, useEffect, useCallback } from 'react'
import { Box, Typography, Card, CardContent, FormControl, InputLabel, Select, MenuItem, Button, Chip, Grid, Avatar, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import RefreshIcon from '@mui/icons-material/Refresh'
import PeopleIcon from '@mui/icons-material/People'
import TodayIcon from '@mui/icons-material/Today'
import OnlinePredictionIcon from '@mui/icons-material/OnlinePrediction'
import api from '../services/api'

function formatTempo(data) {
  const diff = Date.now() - new Date(data).getTime()
  const min = Math.floor(diff / 60000)
  if (min < 1) return 'agora'
  if (min < 60) return `${min}min atrás`
  return `${Math.floor(min / 60)}h${min % 60}min atrás`
}

function corAtividade(data) {
  const diff = Date.now() - new Date(data).getTime()
  if (diff < 600000) return 'success.main'   // <10min
  if (diff < 1800000) return 'warning.main'  // <30min
  return 'text.disabled'
}

export default function Supervisao() {
  const [pesquisas, setPesquisas] = useState([])
  const [pesquisaId, setPesquisaId] = useState('')
  const [dados, setDados] = useState(null)
  const [autoRefresh, setAutoRefresh] = useState(true)

  useEffect(() => { api.get('/pesquisas?limit=100').then((r) => setPesquisas(r.data.pesquisas)) }, [])

  async function carregar() {
    if (!pesquisaId) return
    const r = await api.get(`/supervisao/${pesquisaId}`)
    setDados(r.data)
  }

  useEffect(() => {
    if (!pesquisaId || !autoRefresh) return
    const id = setInterval(carregar, 15000)
    return () => clearInterval(id)
  }, [pesquisaId, autoRefresh])

  useEffect(() => { if (pesquisaId) carregar() }, [pesquisaId])

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1, mb: 2 }}>
        <Typography variant="h1" sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }}>Supervisão em Tempo Real</Typography>
        <Box>
          <Chip
            label={autoRefresh ? 'Auto 15s' : 'Pausado'}
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

      {dados && (
        <Box>
          <Grid container spacing={1.5} sx={{ mb: 2 }}>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Paper elevation={0} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2, textAlign: 'center' }}>
                <PeopleIcon color="primary" sx={{ fontSize: 28 }} />
                <Typography variant="h4" fontWeight={700}>{dados.total}</Typography>
                <Typography variant="caption" color="text.secondary">Total entrevistas</Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Paper elevation={0} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2, textAlign: 'center' }}>
                <TodayIcon color="primary" sx={{ fontSize: 28 }} />
                <Typography variant="h4" fontWeight={700}>{dados.hoje}</Typography>
                <Typography variant="caption" color="text.secondary">Hoje</Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Paper elevation={0} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2, textAlign: 'center' }}>
                <OnlinePredictionIcon color="success" sx={{ fontSize: 28 }} />
                <Typography variant="h4" fontWeight={700}>{dados.ativos}</Typography>
                <Typography variant="caption" color="text.secondary">Ativos (últ. 15min)</Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Paper elevation={0} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2, textAlign: 'center' }}>
                <PeopleIcon color="action" sx={{ fontSize: 28 }} />
                <Typography variant="h4" fontWeight={700}>{dados.entrevistadores?.length || 0}</Typography>
                <Typography variant="caption" color="text.secondary">Entrevistadores</Typography>
              </Paper>
            </Grid>
          </Grid>

          <Card sx={{ mb: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <CardContent sx={{ p: { xs: 1.5, sm: 2 }, '&:last-child': { pb: { xs: 1.5, sm: 2 } } }}>
              <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>Entrevistadores</Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Entrevistador</TableCell>
                      <TableCell align="center">Entrevistas</TableCell>
                      <TableCell align="center">Status</TableCell>
                      <TableCell align="right">Última atividade</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {dados.entrevistadores.map((e) => (
                      <TableRow key={e.id}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar sx={{ width: 28, height: 28, fontSize: '0.75rem', bgcolor: corAtividade(e.ultima_atividade) === 'success.main' ? 'success.main' : 'grey.400' }}>
                              {e.nome?.charAt(0)?.toUpperCase()}
                            </Avatar>
                            {e.nome}
                          </Box>
                        </TableCell>
                        <TableCell align="center">{e.total}</TableCell>
                        <TableCell align="center">
                          <Chip
                            label={Date.now() - new Date(e.ultima_atividade).getTime() < 600000 ? 'Em campo' : 'Inativo'}
                            color={Date.now() - new Date(e.ultima_atividade).getTime() < 600000 ? 'success' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="caption" color="text.secondary">{e.ultima_atividade ? formatTempo(e.ultima_atividade) : '—'}</Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>

          <Card sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <CardContent sx={{ p: { xs: 1.5, sm: 2 }, '&:last-child': { pb: { xs: 1.5, sm: 2 } } }}>
              <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>Últimas entrevistas</Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Nome</TableCell>
                      <TableCell>Entrevistador</TableCell>
                      <TableCell>Bairro</TableCell>
                      <TableCell align="right">Há</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {dados.ultimas.map((e) => (
                      <TableRow key={e.id}>
                        <TableCell>{e.nome}</TableCell>
                        <TableCell>{e.entrevistador}</TableCell>
                        <TableCell>{e.bairro || '—'}</TableCell>
                        <TableCell align="right"><Typography variant="caption" color="text.secondary">{formatTempo(e.created_at)}</Typography></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Box>
      )}
    </Box>
  )
}
