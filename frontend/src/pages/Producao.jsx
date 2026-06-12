import { useState, useEffect } from 'react'
import { Box, Typography, Card, CardContent, FormControl, InputLabel, Select, MenuItem, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, Grid } from '@mui/material'
import AssignmentIcon from '@mui/icons-material/Assignment'
import TodayIcon from '@mui/icons-material/Today'
import HourglassBottomIcon from '@mui/icons-material/HourglassBottom'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import TimerIcon from '@mui/icons-material/Timer'
import GroupIcon from '@mui/icons-material/Group'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line, CartesianGrid,
} from 'recharts'
import api from '../services/api'

const CORES_BARRA = ['#1f3c88', '#3b6cb7', '#5a9bd5', '#8bb8e0', '#b8d4f0', '#dce8f5']
const CORES_PIE = ['#4caf50', '#f44336']

export default function Producao() {
  const [pesquisas, setPesquisas] = useState([])
  const [pesquisaId, setPesquisaId] = useState('')
  const [dados, setDados] = useState(null)
  const [tendencia, setTendencia] = useState([])

  useEffect(() => { api.get('/pesquisas?limit=100').then((r) => setPesquisas(r.data.pesquisas)) }, [])

  useEffect(() => {
    if (!pesquisaId) return
    api.get(`/supervisao/${pesquisaId}/producao`).then((r) => setDados(r.data)).catch(() => {})
    api.get(`/supervisao/${pesquisaId}/tendencia`).then((r) => setTendencia(r.data.dias || [])).catch(() => {})
  }, [pesquisaId])

  const kpis = dados ? [
    { label: 'Total Coletado', value: dados.total_coletado, icon: <AssignmentIcon color="primary" /> },
    { label: 'Hoje', value: dados.hoje, icon: <TodayIcon color="primary" /> },
    { label: 'Em Andamento', value: dados.em_andamento, icon: <HourglassBottomIcon color="warning" /> },
    { label: 'Finalizadas', value: dados.finalizadas, icon: <CheckCircleIcon color="success" /> },
    { label: 'Tempo Médio', value: dados.tempo_medio, icon: <TimerIcon color="action" /> },
  ] : []

  const pieData = dados ? [
    { name: 'Online', value: dados.ranking.filter((e) => e.online).reduce((s, e) => s + e.total, 0) },
    { name: 'Offline', value: dados.ranking.filter((e) => !e.online).reduce((s, e) => s + e.total, 0) },
  ] : []

  const sortedDados = dados ? [...dados.ranking].sort((a, b) => b.total - a.total) : []

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

          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid size={{ xs: 12, md: 8 }}>
              <Card sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="body2" fontWeight={600} sx={{ mb: 1.5 }}>Ranking de Produção</Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={sortedDados} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="nome" tick={{ fontSize: 11 }} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="total" fill="#1f3c88" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Card sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="body2" fontWeight={600} sx={{ mb: 1.5 }}>Online / Offline</Typography>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                        {pieData.map((_, i) => <Cell key={i} fill={CORES_PIE[i % CORES_PIE.length]} />)}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {tendencia.length > 0 && (
            <Card sx={{ mb: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
              <CardContent>
                <Typography variant="body2" fontWeight={600} sx={{ mb: 1.5 }}>Tendência Diária (últimos 30 dias)</Typography>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={tendencia} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="dia" tick={{ fontSize: 10 }} tickFormatter={(v) => v?.slice(5)} />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="total" stroke="#1f3c88" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

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
                      <TableCell align="center">Em Andamento</TableCell>
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
                        <TableCell align="center">{e.em_andamento}</TableCell>
                        <TableCell align="center">{e.tempo_medio}</TableCell>
                        <TableCell align="center">
                          <Chip label={e.online ? 'Online' : 'Offline'} color={e.online ? 'success' : 'default'} size="small" />
                        </TableCell>
                      </TableRow>
                    ))}
                    {dados.ranking.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} align="center">
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