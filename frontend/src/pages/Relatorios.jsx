import { useState, useEffect, useRef } from 'react'
import { Box, Typography, Button, Card, CardContent, Tabs, Tab, FormControl, InputLabel, Select, MenuItem, Chip, Table, TableHead, TableBody, TableRow, TableCell } from '@mui/material'
import { Pie, Bar } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js'
import api from '../services/api'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import PrintIcon from '@mui/icons-material/Print'
import TableChartIcon from '@mui/icons-material/TableChart'
import DownloadIcon from '@mui/icons-material/Download'
import CodeIcon from '@mui/icons-material/Code'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement)

const cores = ['#1d4ed8', '#dc2626', '#16a34a', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316']

export default function Relatorios() {
  const [pesquisas, setPesquisas] = useState([])
  const [pesquisaId, setPesquisaId] = useState('')
  const [estatisticas, setEstatisticas] = useState(null)
  const [aba, setAba] = useState(0)
  const printRef = useRef()

  useEffect(() => { api.get('/pesquisas?limit=100').then((r) => setPesquisas(r.data.pesquisas)) }, [])

  async function carregar() {
    const r = await api.get(`/respostas/estatisticas/${pesquisaId}`)
    setEstatisticas(r.data)
  }

  const perguntas = estatisticas?.perguntas?.filter((p) => p.contagem) || []

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

  function imprimir() {
    window.print()
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1, mb: 2 }}>
        <Typography variant="h1" sx={{ mb: 0, fontSize: { xs: '1.2rem', sm: '1.5rem' } }}>Relatórios</Typography>
        {pesquisaId && (
          <Box className="no-print" sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
            <Button size="small" variant="outlined" startIcon={<PrintIcon />} onClick={imprimir} sx={{ fontSize: '0.7rem' }}>Imprimir</Button>
            <Button size="small" variant="outlined" startIcon={<PictureAsPdfIcon />} onClick={() => exportar('pdf')} sx={{ fontSize: '0.7rem' }}>PDF</Button>
            <Button size="small" variant="outlined" startIcon={<TableChartIcon />} onClick={() => exportar('excel')} sx={{ fontSize: '0.7rem' }}>Excel</Button>
            <Button size="small" variant="outlined" startIcon={<DownloadIcon />} onClick={() => exportar('csv')} sx={{ fontSize: '0.7rem' }}>CSV</Button>
            <Button size="small" variant="outlined" startIcon={<CodeIcon />} onClick={() => exportar('json')} sx={{ fontSize: '0.7rem' }}>JSON</Button>
          </Box>
        )}
      </Box>

      <Box className="no-print" sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 350 } }}>
          <InputLabel>Selecione a pesquisa</InputLabel>
          <Select value={pesquisaId} label="Selecione a pesquisa" onChange={(e) => setPesquisaId(e.target.value)}>
            {pesquisas.map((p) => <MenuItem key={p.id} value={p.id}>{p.titulo}</MenuItem>)}
          </Select>
        </FormControl>
        <Button variant="contained" disabled={!pesquisaId} startIcon={<PlayArrowIcon />} onClick={carregar}>Carregar</Button>
      </Box>

      {estatisticas && (
        <Box ref={printRef}>
          {/* Cabeçalho A4 */}
          <Box id="print-header" className="print-only">
            <Typography variant="h1">Relatório de Pesquisa Eleitoral</Typography>
            <Typography variant="body2">Pesquisa #{pesquisaId} | {new Date().toLocaleDateString('pt-BR')}</Typography>
          </Box>

          <Box className="no-print">
            <Chip label={`Total: ${estatisticas.total_entrevistados} entrevistados`} color="primary" size="small" sx={{ mb: 2 }} />
            <Tabs value={aba} onChange={(_, v) => setAba(v)} sx={{ mb: 2 }}>
              <Tab label="Gráficos" />
              <Tab label="Tabela" />
            </Tabs>
          </Box>

          {/* Conteúdo que aparece em ambos */}
          <Box sx={{ display: aba === 1 || true ? 'block' : 'none' }}>
            {perguntas.map((p) => {
              const total = p.contagem.reduce((s, c) => s + Number(c.quantidade), 0)
              return (
                <Card key={p.pergunta_id} sx={{ mb: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                  <CardContent sx={{ p: { xs: 1.5, sm: 2 }, '&:last-child': { pb: { xs: 1.5, sm: 2 } } }}>
                    <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>{p.titulo}</Typography>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', p: 0.75 }}>Opção</TableCell>
                          <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', p: 0.75 }} align="right">N</TableCell>
                          <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', p: 0.75 }} align="right">%</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {p.contagem.map((c) => (
                          <TableRow key={c.valor}>
                            <TableCell sx={{ fontSize: '0.8rem', p: 0.75 }}>{c.valor}</TableCell>
                            <TableCell sx={{ fontSize: '0.8rem', p: 0.75 }} align="right">{c.quantidade}</TableCell>
                            <TableCell sx={{ fontSize: '0.8rem', p: 0.75 }} align="right">{total > 0 ? `${((Number(c.quantidade) / total) * 100).toFixed(1)}%` : '-'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )
            })}
          </Box>

          {/* Rodapé A4 */}
          <Box id="print-footer" className="print-only">
            <Typography variant="caption">Instituto de Pesquisa Eleitoral | Relatório gerado em {new Date().toLocaleString('pt-BR')}</Typography>
            <Typography variant="caption">Página <span className="page-number" /></Typography>
          </Box>
        </Box>
      )}
    </Box>
  )
}
