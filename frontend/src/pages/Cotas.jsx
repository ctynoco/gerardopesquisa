import { useState, useEffect } from 'react'
import { Box, Typography, Card, CardContent, FormControl, InputLabel, Select, MenuItem, Chip, Button, TextField, Switch, FormControlLabel, Grid, LinearProgress, Paper } from '@mui/material'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import SaveIcon from '@mui/icons-material/Save'
import BarChartIcon from '@mui/icons-material/BarChart'
import api from '../services/api'

const dimensoes = ['genero', 'idade', 'escolaridade', 'renda', 'bairro']
const dimLabels = { genero: 'Sexo', idade: 'Idade', escolaridade: 'Escolaridade', renda: 'Renda Familiar', bairro: 'Bairro' }

export default function Cotas() {
  const [pesquisas, setPesquisas] = useState([])
  const [pesquisaId, setPesquisaId] = useState('')
  const [dados, setDados] = useState(null)
  const [metas, setMetas] = useState({})
  const [ativas, setAtivas] = useState(false)
  const [salvando, setSalvando] = useState(false)

  useEffect(() => { api.get('/pesquisas?limit=100').then((r) => setPesquisas(r.data.pesquisas)) }, [])

  async function carregar() {
    const r = await api.get(`/pesquisas/${pesquisaId}/cotas`)
    setDados(r.data)
    setMetas(r.data.metas || {})
    setAtivas(r.data.cotas_ativas || false)
  }

  async function salvar() {
    setSalvando(true)
    await api.put(`/pesquisas/${pesquisaId}/cotas`, { cotas: metas, cotas_ativas: ativas })
    setSalvando(false)
    carregar()
  }

  function setMeta(dim, valor, alvo) {
    setMetas((prev) => ({
      ...prev,
      [dim]: { ...(prev[dim] || {}), [valor]: Number(alvo) || 0 },
    }))
  }

  function barColor(pct) {
    if (pct >= 100) return 'success.main'
    if (pct >= 70) return 'primary.main'
    if (pct >= 40) return 'warning.main'
    return 'error.main'
  }

  return (
    <Box>
      <Typography variant="h1" sx={{ mb: 2, fontSize: { xs: '1.2rem', sm: '1.5rem' } }}>Controle de Cotas Amostrais</Typography>

      <Card sx={{ mb: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
        <CardContent sx={{ p: { xs: 1.5, sm: 2 }, '&:last-child': { pb: { xs: 1.5, sm: 2 } } }}>
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 300 } }}>
              <InputLabel>Pesquisa</InputLabel>
              <Select value={pesquisaId} label="Pesquisa" onChange={(e) => setPesquisaId(e.target.value)}>
                {pesquisas.map((p) => <MenuItem key={p.id} value={p.id}>{p.titulo}</MenuItem>)}
              </Select>
            </FormControl>
            <Button variant="contained" disabled={!pesquisaId} startIcon={<PlayArrowIcon />} onClick={carregar}>Carregar</Button>
          </Box>
        </CardContent>
      </Card>

      {dados && (
        <Box>
          <Paper elevation={0} sx={{ p: { xs: 1.5, sm: 2 }, mb: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
              <Box>
                <Chip label={`${dados.total_entrevistados} entrevistados`} color="primary" size="small" />
                {dados.tamanho_amostra && <Chip label={`Meta: ${dados.tamanho_amostra}`} variant="outlined" size="small" sx={{ ml: 1 }} />}
              </Box>
              <FormControlLabel control={<Switch checked={ativas} onChange={(e) => setAtivas(e.target.checked)} />} label="Cotas ativas" />
            </Box>
          </Paper>

          {dimensoes.map((dim) => {
            const metasDim = metas[dim] || {}
            const progDim = dados.progresso[dim] || {}
            const todosValores = [...new Set([...Object.keys(metasDim), ...Object.keys(progDim)])].sort()
            if (!todosValores.length) return null

            return (
              <Card key={dim} sx={{ mb: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                <CardContent sx={{ p: { xs: 1.5, sm: 2 }, '&:last-child': { pb: { xs: 1.5, sm: 2 } } }}>
                  <Typography variant="body2" fontWeight={600} sx={{ mb: 1.5 }}>{dimLabels[dim]}</Typography>
                  {todosValores.map((valor) => {
                    const alvo = metasDim[valor] || 0
                    const atual = progDim[valor] || 0
                    const pct = alvo > 0 ? Math.min((atual / alvo) * 100, 100) : 0
                    return (
                      <Box key={valor} sx={{ mb: 1.5, '&:last-child': { mb: 0 } }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1, mb: 0.25 }}>
                          <Typography variant="caption" fontWeight={500} sx={{ flex: 1 }}>{valor}</Typography>
                          <TextField
                            size="small" type="number" value={alvo || ''}
                            onChange={(e) => setMeta(dim, valor, e.target.value)}
                            sx={{ width: 70, '& input': { fontSize: '0.75rem', p: '4px 6px', textAlign: 'center' } }}
                            placeholder="0"
                          />
                          <Typography variant="caption" fontWeight={600} sx={{ minWidth: 60, textAlign: 'right' }}>
                            {atual}/{alvo || '∞'}
                          </Typography>
                        </Box>
                        {alvo > 0 && (
                          <LinearProgress
                            variant="determinate"
                            value={pct}
                            sx={{ height: 6, borderRadius: 3, bgcolor: 'action.hover', '& .MuiLinearProgress-bar': { bgcolor: barColor(pct) } }}
                          />
                        )}
                      </Box>
                    )
                  })}
                </CardContent>
              </Card>
            )
          })}

          <Button variant="contained" startIcon={<SaveIcon />} onClick={salvar} disabled={salvando} sx={{ borderRadius: 2, py: 1.2 }}>
            {salvando ? 'Salvando...' : 'Salvar Cotas'}
          </Button>
        </Box>
      )}
    </Box>
  )
}
