import { useState, useEffect, useRef } from 'react'
import { Box, Typography, Button, Card, CardContent, Tabs, Tab, FormControl, InputLabel, Select, MenuItem, Chip, Table, TableHead, TableBody, TableRow, TableCell, ToggleButtonGroup, ToggleButton, Paper } from '@mui/material'
import { Pie, Bar } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js'
import api from '../services/api'
import LogoUpload, { getLogo } from '../components/LogoUpload'
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
  const [perguntasModelo, setPerguntasModelo] = useState([])
  const [aba, setAba] = useState(0)
  const [modo, setModo] = useState('com_dados')
  const printRef = useRef()

  useEffect(() => { api.get('/pesquisas?limit=100').then((r) => setPesquisas(r.data.pesquisas)) }, [])

  async function carregar() {
    const r = await api.get(`/respostas/estatisticas/${pesquisaId}`)
    setEstatisticas(r.data)
    try {
      const p = await api.get(`/perguntas?pesquisa_id=${pesquisaId}`)
      setPerguntasModelo(p.data.perguntas || p.data || [])
    } catch {
      setPerguntasModelo([])
    }
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

  function ModeloQuestionario() {
    const logo = getLogo()
    return (
      <Box>
        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <ToggleButtonGroup value={modo} exclusive onChange={(_, v) => v && setModo(v)} size="small">
            <ToggleButton value="com_dados" sx={{ fontSize: '0.7rem' }}>Com Dados</ToggleButton>
            <ToggleButton value="sem_dados" sx={{ fontSize: '0.7rem' }}>Sem Dados</ToggleButton>
          </ToggleButtonGroup>
          <LogoUpload size={80} />
        </Box>

        <Paper elevation={0} sx={{ p: { xs: 2, sm: 3 }, border: '1px solid', borderColor: 'divider', borderRadius: 2, backgroundColor: '#fff' }} className="a4-page">
          <Box id="print-header" className="print-only" sx={{ textAlign: 'center', mb: 3 }}>
            {logo && (
              <Box sx={{ mb: 1 }}>
                <img src={logo} alt="Logomarca" style={{ maxWidth: 120, maxHeight: 120 }} />
              </Box>
            )}
            <Typography variant="h4" sx={{ fontSize: '16pt', fontWeight: 700 }}>Questionário de Pesquisa</Typography>
            <Typography variant="body2" color="text.secondary">
              {pesquisas.find((p) => String(p.id) === String(pesquisaId))?.titulo || `Pesquisa #${pesquisaId}`}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, justifyContent: 'space-between', mb: 2, p: 1.5, backgroundColor: 'action.hover', borderRadius: 1, fontSize: '8pt' }}>
            <Typography variant="caption"><strong>Nº:</strong> __________</Typography>
            <Typography variant="caption"><strong>Data:</strong> ___/___/______</Typography>
            <Typography variant="caption"><strong>Hora:</strong> ___:___</Typography>
            <Typography variant="caption"><strong>Total Perguntas:</strong> {perguntasModelo.length || perguntas.length}</Typography>
          </Box>

          {modo === 'com_dados' ? (
            perguntas.map((p) => {
              const total = p.contagem.reduce((s, c) => s + Number(c.quantidade), 0)
              return (
                <Box key={p.pergunta_id} className="questionario-campo" sx={{ mb: 2, pb: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5 }}>{p.titulo}</Typography>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600, fontSize: '0.7rem', p: 0.5 }}>Opção</TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: '0.7rem', p: 0.5 }} align="right">N</TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: '0.7rem', p: 0.5 }} align="right">%</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {p.contagem.map((c) => (
                        <TableRow key={c.valor}>
                          <TableCell sx={{ fontSize: '0.75rem', p: 0.5 }}>{c.valor}</TableCell>
                          <TableCell sx={{ fontSize: '0.75rem', p: 0.5 }} align="right">{c.quantidade}</TableCell>
                          <TableCell sx={{ fontSize: '0.75rem', p: 0.5 }} align="right">{total > 0 ? `${((Number(c.quantidade) / total) * 100).toFixed(1)}%` : '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>
              )
            })
          ) : (
            perguntasModelo.map((p, i) => (
              <Box key={p.id || i} className="questionario-campo" sx={{ mb: 2, pb: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5 }}>{i + 1}. {p.titulo}</Typography>
                <Box className="linha-resposta" sx={{ minHeight: 40 }}>
                  {p.opcoes?.length > 0 ? (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 0.5 }}>
                      {p.opcoes.map((o, oi) => (
                        <Box key={oi} className="questionario-opcao" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mr: 2, mb: 0.5 }}>
                          <Box component="span" sx={{ width: 14, height: 14, border: '1.5px solid #666', borderRadius: p.tipo === 'multipla_escolha' ? 0.5 : '50%', display: 'inline-block', mr: 0.5, verticalAlign: 'middle' }} />
                          <Typography variant="caption" sx={{ fontSize: '8pt' }}>{o}</Typography>
                        </Box>
                      ))}
                    </Box>
                  ) : (
                    <Box sx={{ borderBottom: '1px dashed #999', height: 30, mt: 1, width: '100%' }} />
                  )}
                </Box>
                <Box sx={{ mt: 1.5 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '7pt', display: 'block', mb: 0.25 }}>Observações:</Typography>
                  <Box sx={{ borderBottom: '1px dashed #ccc', height: 24, width: '100%' }} />
                </Box>
              </Box>
            ))
          )}

          <Box id="print-footer" className="print-only" sx={{ textAlign: 'center', borderTop: '1px solid #999', pt: 1, mt: 3 }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '8pt' }}>
              Instituto de Pesquisa Eleitoral | Questionário gerado em {new Date().toLocaleString('pt-BR')}
            </Typography>
          </Box>
        </Paper>
      </Box>
    )
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
          <Box id="print-header" className="print-only">
            <Typography variant="h1">Relatório de Pesquisa Eleitoral</Typography>
            <Typography variant="body2">Pesquisa #{pesquisaId} | {new Date().toLocaleDateString('pt-BR')}</Typography>
          </Box>

          <Box className="no-print">
            <Chip label={`Total: ${estatisticas.total_entrevistados} entrevistados`} color="primary" size="small" sx={{ mb: 2 }} />
            <Tabs value={aba} onChange={(_, v) => setAba(v)} sx={{ mb: 2 }}>
              <Tab label="Gráficos" />
              <Tab label="Tabela" />
              <Tab label="Modelo de Questionário" />
            </Tabs>
          </Box>

          {aba === 0 && (
            <Box>
              {perguntas.map((p) => {
                const total = p.contagem.reduce((s, c) => s + Number(c.quantidade), 0)
                const data = {
                  labels: p.contagem.map((c) => c.valor),
                  datasets: [{ data: p.contagem.map((c) => c.quantidade), backgroundColor: cores.slice(0, p.contagem.length), borderWidth: 0 }],
                }
                return (
                  <Card key={p.pergunta_id} sx={{ mb: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                    <CardContent sx={{ p: { xs: 1.5, sm: 2 }, '&:last-child': { pb: { xs: 1.5, sm: 2 } } }}>
                      <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>{p.titulo}</Typography>
                      <Box sx={{ maxWidth: 400, mx: 'auto' }}>
                        <Pie data={data} options={{ plugins: { legend: { position: 'bottom', labels: { font: { size: 11 } } } }, maintainAspectRatio: true }} />
                      </Box>
                    </CardContent>
                  </Card>
                )
              })}
            </Box>
          )}

          {aba === 1 && (
            <Box>
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
          )}

          {aba === 2 && <ModeloQuestionario />}

          <Box id="print-footer" className="print-only">
            <Typography variant="caption">Instituto de Pesquisa Eleitoral | Relatório gerado em {new Date().toLocaleString('pt-BR')}</Typography>
            <Typography variant="caption">Página <span className="page-number" /></Typography>
          </Box>
        </Box>
      )}
    </Box>
  )
}
