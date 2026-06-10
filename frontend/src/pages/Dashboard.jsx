import { useState, useEffect } from 'react'
import { Box, Typography, Card, CardContent, Grid, Chip, Divider, Button, Table, TableHead, TableBody, TableRow, TableCell } from '@mui/material'
import { Bar } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement } from 'chart.js'
import PollIcon from '@mui/icons-material/Poll'
import QuizIcon from '@mui/icons-material/Quiz'
import PeopleIcon from '@mui/icons-material/People'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import RefreshIcon from '@mui/icons-material/Refresh'
import api from '../services/api'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement)

export default function Dashboard() {
  const [resumo, setResumo] = useState({ pesquisas: 0, entrevistados: 0, perguntas: 0 })
  const [ultimasPesquisas, setUltimasPesquisas] = useState([])

  useEffect(() => {
    async function load() {
      try {
        const [pesquisasRes, entrevistadosRes, perguntasRes] = await Promise.all([
          api.get('/pesquisas?limit=5'),
          api.get('/entrevistados?limit=1000'),
          api.get('/perguntas'),
        ])
        setUltimasPesquisas(pesquisasRes.data.pesquisas)
        setResumo({
          pesquisas: pesquisasRes.data.total,
          entrevistados: entrevistadosRes.data.total,
          perguntas: perguntasRes.data.perguntas.length,
        })
      } catch {}
    }
    load()
  }, [])

  const chartData = {
    labels: ultimasPesquisas.map((p) => p.titulo?.slice(0, 25)),
    datasets: [{
      label: 'Entrevistados',
      data: ultimasPesquisas.map((p) => Number(p.total_entrevistados) || 0),
      backgroundColor: ultimasPesquisas.map(() => '#2563eb'),
      borderRadius: 4,
    }],
  }

  const cards = [
    { label: 'Pesquisas realizadas', value: resumo.pesquisas, icon: <PollIcon sx={{ fontSize: 32 }} />, color: '#2563eb' },
    { label: 'Perguntas cadastradas', value: resumo.perguntas, icon: <QuizIcon sx={{ fontSize: 32 }} />, color: '#7c3aed' },
    { label: 'Entrevistados', value: resumo.entrevistados, icon: <PeopleIcon sx={{ fontSize: 32 }} />, color: '#059669' },
  ]

  const totalEntrev = ultimasPesquisas.reduce((sum, p) => sum + (Number(p.total_entrevistados) || 0), 0)

  return (
    <Box>
      {/* Header estilo instituto de pesquisa */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 1 }}>
        <Box>
          <Typography variant="h1" sx={{ mb: 0.5 }}>Dashboard</Typography>
          <Typography variant="body2" color="text.secondary">
            <CalendarTodayIcon sx={{ fontSize: 14, verticalAlign: 'middle', mr: 0.5 }} />
            Atualizado em {new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </Typography>
        </Box>
        <Button size="small" startIcon={<RefreshIcon />} onClick={() => window.location.reload()} sx={{ display: { xs: 'none', sm: 'inline-flex' } }}>
          Atualizar
        </Button>
      </Box>

      {/* Cards de resumo */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {cards.map((c) => (
          <Grid item xs={12} sm={4} key={c.label}>
            <Card sx={{ borderLeft: `4px solid ${c.color}` }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 2.5, '&:last-child': { pb: 2.5 } }}>
                <Box sx={{ width: 48, height: 48, borderRadius: 2, backgroundColor: `${c.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: c.color }}>
                  {c.icon}
                </Box>
                <Box>
                  <Typography variant="h3" sx={{ fontSize: 26, fontWeight: 700 }}>{c.value}</Typography>
                  <Typography variant="body2" color="text.secondary">{c.label}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Metodologia da pesquisa ativa */}
      {ultimasPesquisas.filter((p) => p.status === 'ativa').length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <TrendingUpIcon color="primary" />
              <Typography variant="h2">Pesquisas em Campo</Typography>
            </Box>
            <Grid container spacing={2}>
              {ultimasPesquisas.filter((p) => p.status === 'ativa').map((p) => (
                <Grid item xs={12} key={p.id}>
                  <Box sx={{ p: 2, backgroundColor: 'action.hover', borderRadius: 2 }}>
                    <Typography variant="h3" sx={{ mb: 1 }}>{p.titulo}</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mb: 1 }}>
                      <Chip icon={<PeopleIcon />} label={`${p.total_entrevistados || 0} entrevistas`} size="small" variant="outlined" />
                      {p.margem_erro && <Chip label={`±${p.margem_erro}pp`} size="small" variant="outlined" />}
                      {p.nivel_confianca && <Chip label={`${p.nivel_confianca}% confiança`} size="small" variant="outlined" />}
                      <Chip label={`Registro TSE: ${p.id}`} size="small" variant="outlined" />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      População alvo: {Number(p.populacao_alvo || 0).toLocaleString('pt-BR')} eleitores | Amostra: {p.tamanho_amostra || '-'}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Gráfico com tabela */}
      <Card>
        <CardContent>
          <Typography variant="h2" sx={{ mb: 2 }}>Entrevistados por Pesquisa</Typography>
          {ultimasPesquisas.length > 0 ? (
            <>
              <Box sx={{ mb: 2 }}>
                <Bar data={chartData} options={{ responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } }} />
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Detalhamento</Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Pesquisa</TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="right">Entrevistados</TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="right">% do total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {ultimasPesquisas.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>{p.titulo?.slice(0, 35)}</TableCell>
                      <TableCell align="right">{Number(p.total_entrevistados) || 0}</TableCell>
                      <TableCell align="right">
                        {totalEntrev > 0 ? `${((Number(p.total_entrevistados) / totalEntrev) * 100).toFixed(1)}%` : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </>
          ) : (
            <Typography variant="body2" color="text.secondary">Nenhuma pesquisa cadastrada. Crie sua primeira pesquisa para começar.</Typography>
          )}
        </CardContent>
      </Card>
    </Box>
  )
}
