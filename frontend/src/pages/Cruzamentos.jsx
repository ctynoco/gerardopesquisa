import { useState, useEffect } from 'react'
import { Box, Typography, Card, CardContent, FormControl, InputLabel, Select, MenuItem, Chip, Button, Tabs, Tab, Paper } from '@mui/material'
import { Bar } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import MergeTypeIcon from '@mui/icons-material/MergeType'
import api from '../services/api'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const cores = ['#1d4ed8', '#dc2626', '#16a34a', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316', '#64748b', '#14b8a6']

const dimensoes = ['genero', 'idade', 'escolaridade', 'renda']
const dimLabels = { genero: 'Sexo', idade: 'Idade', escolaridade: 'Escolaridade', renda: 'Renda Familiar' }

export default function Cruzamentos() {
  const [pesquisas, setPesquisas] = useState([])
  const [pesquisaId, setPesquisaId] = useState('')
  const [dados, setDados] = useState(null)
  const [dimAba, setDimAba] = useState(0)
  const [perguntaSel, setPerguntaSel] = useState(0)

  useEffect(() => { api.get('/pesquisas?limit=100').then((r) => setPesquisas(r.data.pesquisas)) }, [])

  async function carregar() {
    const r = await api.get(`/cruzamentos/${pesquisaId}/completo`)
    setDados(r.data)
    setPerguntaSel(0)
    setDimAba(0)
  }

  const dimAtual = dimensoes[dimAba]
  const perguntas = dados?.perguntas || []
  const pergunta = perguntas[perguntaSel] || null

  function buildChart(p, dim) {
    if (!p?.linhas?.length) return null
    const labels = p.linhas.map((l) => l.valor?.length > 20 ? l.valor.slice(0, 18) + '..' : (l.valor || ''))
    const grupos = [...new Set(p.linhas.flatMap((l) => Object.keys(l[dim] || {})))]
    if (!grupos.length) return null
    const datasets = grupos.map((g, i) => ({
      label: g,
      data: p.linhas.map((l) => (l[dim] && l[dim][g]) || 0),
      backgroundColor: cores[i % cores.length],
      borderRadius: 3,
    }))
    return { labels, datasets }
  }

  function tabelaDim(p, dim) {
    const grupos = [...new Set(p.linhas.flatMap((l) => Object.keys(l[dim] || {})))]
    return (
      <Box sx={{ width: '100%', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: '6px 8px', borderBottom: '2px solid #ddd', fontWeight: 600, whiteSpace: 'nowrap' }}>Resposta</th>
              <th style={{ textAlign: 'right', padding: '6px 8px', borderBottom: '2px solid #ddd', fontWeight: 600 }}>Total</th>
              {dim === 'idade' && <th style={{ textAlign: 'right', padding: '6px 8px', borderBottom: '2px solid #ddd', fontWeight: 600, whiteSpace: 'nowrap' }}>Idade Média</th>}
              {grupos.map((g) => (
                <th key={g} style={{ textAlign: 'right', padding: '6px 8px', borderBottom: '2px solid #ddd', fontWeight: 600, whiteSpace: 'nowrap', fontSize: '0.65rem' }}>{g}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {p.linhas.map((linha) => {
              const total = Object.values(linha[dim] || {}).reduce((s, v) => s + v, 0)
              return (
                <tr key={linha.valor}>
                  <td style={{ padding: '5px 8px', borderBottom: '1px solid #eee', fontWeight: 500 }}>{linha.valor}</td>
                  <td style={{ padding: '5px 8px', borderBottom: '1px solid #eee', textAlign: 'right' }}>{total}</td>
                  {dim === 'idade' && <td style={{ padding: '5px 8px', borderBottom: '1px solid #eee', textAlign: 'right' }}>{linha.idade_media || '-'}</td>}
                  {grupos.map((g) => (
                    <td key={g} style={{ padding: '5px 8px', borderBottom: '1px solid #eee', textAlign: 'right' }}>
                      {total > 0 && linha[dim]?.[g] ? `${((linha[dim][g] / total) * 100).toFixed(1)}%` : '-'}
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </Box>
    )
  }

  return (
    <Box>
      <Typography variant="h1" sx={{ mb: 2, fontSize: { xs: '1.2rem', sm: '1.5rem' } }}>Cruzamentos</Typography>

      <Card sx={{ mb: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
        <CardContent sx={{ p: { xs: 1.5, sm: 2 }, '&:last-child': { pb: { xs: 1.5, sm: 2 } } }}>
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 300 } }}>
              <InputLabel>Pesquisa</InputLabel>
              <Select value={pesquisaId} label="Pesquisa" onChange={(e) => setPesquisaId(e.target.value)}>
                {pesquisas.map((p) => <MenuItem key={p.id} value={p.id}>{p.titulo}</MenuItem>)}
              </Select>
            </FormControl>
            <Button variant="contained" disabled={!pesquisaId} startIcon={<PlayArrowIcon />} onClick={carregar}>Calcular</Button>
          </Box>
        </CardContent>
      </Card>

      {dados && (
        <Box>
          <Chip icon={<MergeTypeIcon />} label={`${dados.total_entrevistados} entrevistados | Cruzamento completo: Sexo × Idade × Escolaridade × Renda`} color="primary" size="small" sx={{ mb: 2 }} />

          <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
            <Box sx={{ width: { xs: '100%', md: 240 }, flexShrink: 0 }}>
              <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
                <Typography variant="caption" fontWeight={600} sx={{ display: 'block', px: 1.5, py: 1, borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'action.hover' }}>
                  Perguntas ({perguntas.length})
                </Typography>
                {perguntas.map((p, i) => (
                  <Box key={p.pergunta_id} onClick={() => setPerguntaSel(i)}
                    sx={{
                      px: 1.5, py: 1, cursor: 'pointer', borderBottom: '1px solid', borderColor: 'divider',
                      bgcolor: perguntaSel === i ? 'primary.main' : 'transparent',
                      color: perguntaSel === i ? '#fff' : 'text.primary',
                      '&:hover': { bgcolor: perguntaSel === i ? 'primary.dark' : 'action.hover' },
                      transition: '0.15s',
                    }}
                  >
                    <Typography variant="caption" fontWeight={perguntaSel === i ? 600 : 400}>{i + 1}. {p.titulo}</Typography>
                  </Box>
                ))}
              </Paper>
            </Box>

            <Box sx={{ flex: 1, minWidth: 0 }}>
              {pergunta && (
                <Card sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                  <CardContent sx={{ p: { xs: 1.5, sm: 2 }, '&:last-child': { pb: { xs: 1.5, sm: 2 } } }}>
                    <Typography variant="body2" fontWeight={600} sx={{ mb: 1.5 }}>{pergunta.titulo}</Typography>

                    <Tabs value={dimAba} onChange={(_, v) => setDimAba(v)} sx={{ mb: 1.5, minHeight: 32, '& .MuiTab-root': { minHeight: 32, fontSize: '0.75rem', py: 0 } }}>
                      {dimensoes.map((d) => <Tab key={d} label={dimLabels[d]} />)}
                    </Tabs>

                    {tabelaDim(pergunta, dimAtual)}

                    {buildChart(pergunta, dimAtual) && (
                      <Box sx={{ mt: 2, maxWidth: 500, mx: 'auto' }}>
                        <Bar
                          data={buildChart(pergunta, dimAtual)}
                          options={{
                            responsive: true,
                            plugins: { legend: { position: 'bottom', labels: { font: { size: 10 } } } },
                            scales: { x: { stacked: false, ticks: { font: { size: 9 } } }, y: { beginAtZero: true, ticks: { font: { size: 9 } } } },
                          }}
                        />
                      </Box>
                    )}
                  </CardContent>
                </Card>
              )}
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  )
}
