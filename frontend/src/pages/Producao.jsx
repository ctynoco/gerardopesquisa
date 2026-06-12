import { useState, useEffect } from 'react'
import { Box, Typography, Card, CardContent, FormControl, InputLabel, Select, MenuItem, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, Grid, LinearProgress } from '@mui/material'
import AssignmentIcon from '@mui/icons-material/Assignment'
import TodayIcon from '@mui/icons-material/Today'
import HourglassBottomIcon from '@mui/icons-material/HourglassBottom'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import TimerIcon from '@mui/icons-material/Timer'
import api from '../services/api'

function maxTotal(ranking) {
  return ranking.reduce((m, e) => Math.max(m, e.total), 0) || 1
}

export default function Producao() {
  const [pesquisas, setPesquisas] = useState([])
  const [pesquisaId, setPesquisaId] = useState('')
  const [dados, setDados] = useState(null)

  useEffect(() => { api.get('/pesquisas?limit=100').then((r) => setPesquisas(r.data.pesquisas)) }, [])

  useEffect(() => {
    if (!pesquisaId) return
    api.get(`/supervisao/${pesquisaId}/producao`).then((r) => setDados(r.data)).catch(() => {})
  }, [pesquisaId])

  const kpis = dados ? [
    { label: 'Total Coletado', value: dados.total_coletado, icon: <AssignmentIcon color="primary" /> },
    { label: 'Hoje', value: dados.hoje, icon: <TodayIcon color="primary" /> },
    { label: 'Em Andamento', value: dados.em_andamento, icon: <HourglassBottomIcon color="warning" /> },
    { label: 'Finalizadas', value: dados.finalizadas, icon: <CheckCircleIcon color="success" /> },
    { label: 'Tempo Médio', value: dados.tempo_medio, icon: <TimerIcon color="action" /> },
  ] : []

  const maxVal = dados ? maxTotal(dados.ranking) : 1

  return (
    <Box>
      <Typography variant="h1" sx={{ mb: 2, fontSize: { xs: '1.2rem', sm: '1.5rem' } }}>
        Produção dos Entrevistadores
      </Typography>

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
        <>
          <Grid container spacing={1.5} sx={{ mb: 2 }}>
            {kpis.map((k) => (
              <Grid key={k.label} size={{ xs: 6, sm: 4, md: 2.4 }}>
                <Paper elevation={0} sx={{ p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 2, textAlign: 'center' }}>
                  {k.icon}
                  <Typography variant="h5" fontWeight={700}>{k.value}</Typography>
                  <Typography variant="caption" color="text.secondary">{k.label}</Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>

          <Card sx={{ mb: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <CardContent sx={{ p: { xs: 1.5, sm: 2 }, '&:last-child': { pb: { xs: 1.5, sm: 2 } } }}>
              <Typography variant="body2" fontWeight={600} sx={{ mb: 1.5 }}>Ranking</Typography>
              {dados.ranking.map((e) => (
                <Box key={e.id} sx={{ mb: 1.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.25 }}>
                    <Typography variant="body2" fontWeight={500}>{e.nome}</Typography>
                    <Typography variant="body2" fontWeight={700}>{e.total}</Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={(e.total / maxVal) * 100}
                    sx={{ height: 24, borderRadius: 1, '& .MuiLinearProgress-bar': { borderRadius: 1, bgcolor: '#1f3c88' } }}
                  />
                </Box>
              ))}
            </CardContent>
          </Card>

          <Card sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <CardContent sx={{ p: { xs: 1.5, sm: 2 }, '&:last-child': { pb: { xs: 1.5, sm: 2 } } }}>
              <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>Produção por Entrevistador</Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Nome</TableCell>
                      <TableCell align="center">Pesquisas</TableCell>
                      <TableCell align="center">Concluídas</TableCell>
                      <TableCell align="center">Tempo Médio</TableCell>
                      <TableCell align="center">Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {dados.ranking.map((e) => (
                      <TableRow key={e.id}>
                        <TableCell>{e.nome}</TableCell>
                        <TableCell align="center">{e.total}</TableCell>
                        <TableCell align="center">{e.concluidas}</TableCell>
                        <TableCell align="center">{e.tempo_medio}</TableCell>
                        <TableCell align="center">
                          <Chip
                            label={e.online ? 'Online' : 'Offline'}
                            color={e.online ? 'success' : 'default'}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                    {dados.ranking.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>Nenhum dado encontrado</Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </>
      )}
    </Box>
  )
}