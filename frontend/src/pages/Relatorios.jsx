import { useState, useEffect } from 'react'
import { Box, Typography, Button, Card, CardContent, Tabs, Tab, FormControl, InputLabel, Select, MenuItem, Chip, Table, TableHead, TableBody, TableRow, TableCell } from '@mui/material'
import { Pie, Bar } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
import 'leaflet/dist/leaflet.css'
import api from '../services/api'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import TableChartIcon from '@mui/icons-material/TableChart'
import DownloadIcon from '@mui/icons-material/Download'
import CodeIcon from '@mui/icons-material/Code'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement)

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({ iconUrl: markerIcon, iconRetinaUrl: markerIcon2x, shadowUrl: markerShadow })

const cores = ['#2563eb', '#dc2626', '#16a34a', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316']

export default function Relatorios() {
  const [pesquisas, setPesquisas] = useState([])
  const [pesquisaId, setPesquisaId] = useState('')
  const [estatisticas, setEstatisticas] = useState(null)
  const [aba, setAba] = useState(0)

  useEffect(() => {
    api.get('/pesquisas?limit=100').then((res) => setPesquisas(res.data.pesquisas))
  }, [])

  async function carregar() {
    const res = await api.get(`/respostas/estatisticas/${pesquisaId}`)
    setEstatisticas(res.data)
  }

  const perguntasComGrafico = estatisticas?.perguntas?.filter((p) => p.contagem) || []
  const perguntasNumericas = estatisticas?.perguntas?.filter((p) => p.estatisticas) || []

  async function exportar(formato) {
    if (!pesquisaId) return
    const url = api.defaults.baseURL + `/exportacao/${formato}/${pesquisaId}`
    const token = localStorage.getItem('token')
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
    const blob = await res.blob()
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.click()
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h1" sx={{ mb: 0 }}>Relatórios</Typography>
        {pesquisaId && (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button size="small" variant="outlined" startIcon={<PictureAsPdfIcon />} onClick={() => exportar('pdf')}>PDF</Button>
            <Button size="small" variant="outlined" startIcon={<TableChartIcon />} onClick={() => exportar('excel')}>Excel</Button>
            <Button size="small" variant="outlined" startIcon={<DownloadIcon />} onClick={() => exportar('csv')}>CSV</Button>
            <Button size="small" variant="outlined" startIcon={<CodeIcon />} onClick={() => exportar('json')}>JSON</Button>
          </Box>
        )}
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'flex-end' }}>
        <FormControl size="small" sx={{ minWidth: 350 }}>
          <InputLabel>Selecione a pesquisa</InputLabel>
          <Select value={pesquisaId} label="Selecione a pesquisa" onChange={(e) => setPesquisaId(e.target.value)}>
            {pesquisas.map((p) => <MenuItem key={p.id} value={p.id}>{p.titulo}</MenuItem>)}
          </Select>
        </FormControl>
        <Button variant="contained" disabled={!pesquisaId} startIcon={<PlayArrowIcon />} onClick={carregar}>Carregar</Button>
      </Box>

      {estatisticas && (
        <Box>
          <Chip label={`Total de entrevistados: ${estatisticas.total_entrevistados}`} color="primary" sx={{ mb: 2 }} />

          <Tabs value={aba} onChange={(_, v) => setAba(v)} sx={{ mb: 2 }}>
            <Tab label="Gráficos" />
            <Tab label="Mapa" />
            <Tab label="Tabela" />
          </Tabs>

          {aba === 0 && (
            <Box>
              {perguntasComGrafico.map((p) => {
                const chartData = {
                  labels: p.contagem.map((c) => c.valor),
                  datasets: [{ data: p.contagem.map((c) => Number(c.quantidade)), backgroundColor: cores.slice(0, p.contagem.length) }],
                }
                return (
                  <Card key={p.pergunta_id} sx={{ mb: 2 }}>
                    <CardContent>
                      <Typography variant="h3" sx={{ mb: 1 }}>{p.titulo}</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Total: {p.total} respostas</Typography>
                      <Box sx={{ maxWidth: 400, mx: 'auto' }}>
                        <Pie data={chartData} />
                      </Box>
                    </CardContent>
                  </Card>
                )
              })}
              {perguntasNumericas.map((p) => (
                <Card key={p.pergunta_id} sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="h3">{p.titulo}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Média: {Number(p.estatisticas.media).toFixed(2)} | Mín: {p.estatisticas.minimo} | Máx: {p.estatisticas.maximo}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}

          {aba === 1 && (
            <Card>
              <CardContent>
                <Typography variant="h3" sx={{ mb: 2 }}>Distribuição Geográfica</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Em breve: mapa com distribuição dos entrevistados por localidade.</Typography>
                <Box sx={{ height: 400, backgroundColor: 'action.hover', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'text.secondary' }}>
                  Mapa interativo (requer dados de cidade/estado dos entrevistados)
                </Box>
              </CardContent>
            </Card>
          )}

          {aba === 2 && perguntasComGrafico.map((p) => (
            <Card key={p.pergunta_id} sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h3" sx={{ mb: 2 }}>{p.titulo}</Typography>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Opção</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Quantidade</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>%</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {p.contagem.map((c) => (
                      <TableRow key={c.valor}>
                        <TableCell>{c.valor}</TableCell>
                        <TableCell>{c.quantidade}</TableCell>
                        <TableCell>{((Number(c.quantidade) / p.total) * 100).toFixed(1)}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
    </Box>
  )
}
