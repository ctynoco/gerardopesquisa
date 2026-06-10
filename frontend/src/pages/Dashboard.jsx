import { useState, useEffect } from 'react'
import { Box, Typography, Card, CardContent, Grid } from '@mui/material'
import { Bar } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement } from 'chart.js'
import PollIcon from '@mui/icons-material/Poll'
import QuizIcon from '@mui/icons-material/Quiz'
import PeopleIcon from '@mui/icons-material/People'
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
    labels: ultimasPesquisas.map((p) => p.titulo?.slice(0, 20)),
    datasets: [{
      label: 'Entrevistados',
      data: ultimasPesquisas.map((p) => Number(p.total_entrevistados) || 0),
      backgroundColor: '#2563eb',
      borderRadius: 4,
    }],
  }

  const cards = [
    { label: 'Pesquisas', value: resumo.pesquisas, icon: <PollIcon sx={{ fontSize: 36, color: '#2563eb' }} />, bg: '#dbeafe' },
    { label: 'Perguntas', value: resumo.perguntas, icon: <QuizIcon sx={{ fontSize: 36, color: '#7c3aed' }} />, bg: '#ede9fe' },
    { label: 'Entrevistados', value: resumo.entrevistados, icon: <PeopleIcon sx={{ fontSize: 36, color: '#059669' }} />, bg: '#d1fae5' },
  ]

  return (
    <Box>
      <Typography variant="h1" sx={{ mb: 3 }}>Dashboard</Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {cards.map((c) => (
          <Grid item xs={12} sm={4} key={c.label}>
            <Card>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 3, '&:last-child': { pb: 3 } }}>
                <Box sx={{ width: 56, height: 56, borderRadius: 2, backgroundColor: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {c.icon}
                </Box>
                <Box>
                  <Typography variant="h3" sx={{ fontSize: 28, fontWeight: 700 }}>{c.value}</Typography>
                  <Typography variant="body2" color="text.secondary">{c.label}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Card>
        <CardContent>
          <Typography variant="h2" sx={{ mb: 2 }}>Entrevistados por Pesquisa</Typography>
          <Bar data={chartData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
        </CardContent>
      </Card>
    </Box>
  )
}
