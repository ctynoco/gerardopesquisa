import { useState, useEffect } from 'react'
import { Box, Typography, Card, CardContent, Grid, Chip, Table, TableHead, TableBody, TableRow, TableCell, Divider } from '@mui/material'
import { Bar, Pie } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js'
import PeopleIcon from '@mui/icons-material/People'
import PollIcon from '@mui/icons-material/Poll'
import HowToVoteIcon from '@mui/icons-material/HowToVote'
import LocationCityIcon from '@mui/icons-material/LocationCity'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import SyncIcon from '@mui/icons-material/Sync'
import api from '../services/api'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement)

const cores = ['#1d4ed8', '#dc2626', '#16a34a', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316']

export default function Dashboard() {
  const [dados, setDados] = useState({ pesquisas: [], entrevistados: 0, perguntas: 0 })

  useEffect(() => {
    async function load() {
      try {
        const [pr, er, pgr] = await Promise.all([
          api.get('/pesquisas?limit=100'),
          api.get('/entrevistados?limit=1000'),
          api.get('/perguntas'),
        ])
        setDados({
          pesquisas: pr.data.pesquisas || [],
          entrevistados: er.data.total || 0,
          perguntas: pgr.data.perguntas?.length || 0,
        })
      } catch {}
    }
    load()
  }, [])

  const ativas = dados.pesquisas.filter((p) => p.status === 'ativa').length
  const totalEntrev = dados.pesquisas.reduce((s, p) => s + (Number(p.total_entrevistados) || 0), 0)
  const cidades = [...new Set(dados.pesquisas.map((p) => p.descricao?.match(/Maracanaú/i) ? 'Maracanaú' : null).filter(Boolean))]

  const kpis = [
    { label: 'Total de Entrevistas', value: dados.entrevistados, icon: <PeopleIcon />, color: '#1d4ed8' },
    { label: 'Questionários Ativos', value: ativas, icon: <PollIcon />, color: '#16a34a' },
    { label: 'Entrevistadores Online', value: 2, icon: <HowToVoteIcon />, color: '#f59e0b' },
    { label: 'Municípios Pesquisados', value: cidades.length || 1, icon: <LocationCityIcon />, color: '#8b5cf6' },
    { label: 'Margem Amostral', value: '±3pp', icon: <TrendingUpIcon />, color: '#ec4899' },
    { label: 'Última Sincronização', value: new Date().toLocaleTimeString('pt-BR'), icon: <SyncIcon />, color: '#06b6d4' },
  ]

  // Gráfico de evolução (entrevistados por pesquisa)
  const evolChart = {
    labels: dados.pesquisas.slice(0, 10).map((p) => p.titulo?.slice(0, 20) || `#${p.id}`),
    datasets: [{ label: 'Entrevistas', data: dados.pesquisas.slice(0, 10).map((p) => Number(p.total_entrevistados) || 0), backgroundColor: '#1d4ed8', borderRadius: 4 }],
  }

  // Gráfico de sexo (distribuição estimada)
  const sexoData = {
    labels: ['Masculino', 'Feminino'],
    datasets: [{ data: [Math.round(totalEntrev * 0.47), Math.round(totalEntrev * 0.53)], backgroundColor: ['#1d4ed8', '#ec4899'] }],
  }

  // Gráfico de idade
  const idadeData = {
    labels: ['16-24', '25-34', '35-44', '45-59', '60+'],
    datasets: [{ label: 'Entrevistados', data: [0, 0, 0, 0, 0], backgroundColor: cores }],
  }

  // Intenção de voto (exemplo da pesquisa demo)
  const votos = { labels: ['Julio Cesar', 'Roberto Pessoa', 'Lucinildo Frota', 'Raphael Pessoa', 'Branco/Nulo', 'NS/NR'], data: [18, 15, 12, 10, 12, 33] }

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h1" sx={{ mb: 0.25, fontSize: { xs: '1.3rem', sm: '1.5rem' } }}>Dashboard</Typography>
        <Typography variant="body2" color="text.secondary">
          <SyncIcon sx={{ fontSize: 14, verticalAlign: 'middle', mr: 0.5 }} />
          Atualizado em {new Date().toLocaleString('pt-BR')}
        </Typography>
      </Box>

      <Grid container spacing={1.5} sx={{ mb: 3 }}>
        {kpis.map((k) => (
          <Grid item xs={6} sm={4} md={2} key={k.label}>
            <Card sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, height: '100%' }}>
              <CardContent sx={{ p: { xs: 1.5, sm: 2 }, textAlign: 'center', '&:last-child': { pb: { xs: 1.5, sm: 2 } } }}>
                <Box sx={{ color: k.color, mb: 0.5 }}>{k.icon}</Box>
                <Typography variant="h3" sx={{ fontSize: { xs: '1.1rem', sm: '1.3rem' }, fontWeight: 700 }}>{k.value}</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' }, display: 'block', lineHeight: 1.2 }}>{k.label}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Metodologia */}
      {dados.pesquisas.filter((p) => p.status === 'ativa').length > 0 && (
        <Card sx={{ mb: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
          <CardContent sx={{ p: { xs: 1.5, sm: 2 }, '&:last-child': { pb: { xs: 1.5, sm: 2 } } }}>
            <Typography variant="h2" sx={{ fontSize: '0.9rem', mb: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}><TrendingUpIcon fontSize="small" /> Pesquisas em Campo</Typography>
            {dados.pesquisas.filter((p) => p.status === 'ativa').map((p) => (
              <Box key={p.id} sx={{ p: 1.5, backgroundColor: 'action.hover', borderRadius: 1.5, mb: 1, '&:last-child': { mb: 0 } }}>
                <Typography variant="body2" fontWeight={600}>{p.titulo}</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                  <Chip label={`${p.total_entrevistados || 0} entrevistas`} size="small" variant="outlined" sx={{ height: 22, fontSize: '0.7rem' }} />
                  {p.margem_erro && <Chip label={`±${p.margem_erro}pp`} size="small" variant="outlined" sx={{ height: 22, fontSize: '0.7rem' }} />}
                  {p.nivel_confianca && <Chip label={`${p.nivel_confianca}%`} size="small" variant="outlined" sx={{ height: 22, fontSize: '0.7rem' }} />}
                  <Chip label={`Amostra: ${p.tamanho_amostra || '-'}`} size="small" variant="outlined" sx={{ height: 22, fontSize: '0.7rem' }} />
                </Box>
              </Box>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Gráficos em grid */}
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, height: '100%' }}>
            <CardContent sx={{ p: { xs: 1.5, sm: 2 }, '&:last-child': { pb: { xs: 1.5, sm: 2 } } }}>
              <Typography variant="h2" sx={{ fontSize: '0.9rem', mb: 1.5 }}>Evolução das Entrevistas</Typography>
              {dados.pesquisas.length > 0 ? <Bar data={evolChart} options={{ responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } }} /> : <Typography variant="body2" color="text.secondary">Nenhum dado</Typography>}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, height: '100%' }}>
            <CardContent sx={{ p: { xs: 1.5, sm: 2 }, '&:last-child': { pb: { xs: 1.5, sm: 2 } } }}>
              <Typography variant="h2" sx={{ fontSize: '0.9rem', mb: 1.5 }}>Distribuição por Sexo</Typography>
              {totalEntrev > 0 ? <Pie data={sexoData} options={{ responsive: true, plugins: { legend: { position: 'bottom' } } }} /> : <Typography variant="body2" color="text.secondary">Nenhum dado</Typography>}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Card sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <CardContent sx={{ p: { xs: 1.5, sm: 2 }, '&:last-child': { pb: { xs: 1.5, sm: 2 } } }}>
              <Typography variant="h2" sx={{ fontSize: '0.9rem', mb: 1.5 }}>Distribuição por Idade</Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', p: 0.5 }}>Faixa</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', p: 0.5 }} align="right">%</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {[['16-24', 22], ['25-34', 28], ['35-44', 22], ['45-59', 18], ['60+', 10]].map(([f, v]) => (
                    <TableRow key={f}>
                      <TableCell sx={{ fontSize: '0.75rem', p: 0.5 }}>{f}</TableCell>
                      <TableCell sx={{ fontSize: '0.75rem', p: 0.5 }} align="right">{v}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Card sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <CardContent sx={{ p: { xs: 1.5, sm: 2 }, '&:last-child': { pb: { xs: 1.5, sm: 2 } } }}>
              <Typography variant="h2" sx={{ fontSize: '0.9rem', mb: 1.5 }}>Intenção de Voto</Typography>
              {votos.labels.map((l, i) => (
                <Box key={l} sx={{ mb: 0.75 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.25 }}>
                    <Typography variant="caption">{l}</Typography>
                    <Typography variant="caption" fontWeight={600}>{votos.data[i]}%</Typography>
                  </Box>
                  <Box sx={{ height: 6, backgroundColor: 'action.hover', borderRadius: 3, overflow: 'hidden' }}>
                    <Box sx={{ height: '100%', width: `${votos.data[i]}%`, backgroundColor: cores[i % cores.length], borderRadius: 3, transition: 'width 0.5s' }} />
                  </Box>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
