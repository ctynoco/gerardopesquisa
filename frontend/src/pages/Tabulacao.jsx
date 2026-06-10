import { useState, useEffect } from 'react'
import { Box, Typography, Card, CardContent, FormControl, InputLabel, Select, MenuItem, Table, TableHead, TableBody, TableRow, TableCell, Chip, Button, Grid } from '@mui/material'
import FilterListIcon from '@mui/icons-material/FilterList'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import api from '../services/api'

export default function Tabulacao() {
  const [pesquisas, setPesquisas] = useState([])
  const [pesquisaId, setPesquisaId] = useState('')
  const [estatisticas, setEstatisticas] = useState(null)
  const [filtros, setFiltros] = useState({ genero: '', escolaridade: '', renda: '' })

  useEffect(() => { api.get('/pesquisas?limit=100').then((r) => setPesquisas(r.data.pesquisas)) }, [])

  async function carregar() {
    const r = await api.get(`/respostas/estatisticas/${pesquisaId}`)
    setEstatisticas(r.data)
  }

  const perguntas = estatisticas?.perguntas?.filter((p) => p.contagem) || []

  return (
    <Box>
      <Typography variant="h1" sx={{ mb: 2, fontSize: { xs: '1.2rem', sm: '1.5rem' } }}>Tabulação</Typography>

      <Card sx={{ mb: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
        <CardContent sx={{ p: { xs: 1.5, sm: 2 }, '&:last-child': { pb: { xs: 1.5, sm: 2 } } }}>
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 300 } }}>
              <InputLabel>Selecione a pesquisa</InputLabel>
              <Select value={pesquisaId} label="Selecione a pesquisa" onChange={(e) => setPesquisaId(e.target.value)}>
                {pesquisas.map((p) => <MenuItem key={p.id} value={p.id}>{p.titulo}</MenuItem>)}
              </Select>
            </FormControl>
            <Button variant="contained" disabled={!pesquisaId} startIcon={<PlayArrowIcon />} onClick={carregar}>Carregar</Button>
          </Box>

          <Box sx={{ display: 'flex', gap: 1.5, mt: 2, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Sexo</InputLabel>
              <Select value={filtros.genero} label="Sexo" onChange={(e) => setFiltros({ ...filtros, genero: e.target.value })}>
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="Masculino">Masculino</MenuItem>
                <MenuItem value="Feminino">Feminino</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Escolaridade</InputLabel>
              <Select value={filtros.escolaridade} label="Escolaridade" onChange={(e) => setFiltros({ ...filtros, escolaridade: e.target.value })}>
                <MenuItem value="">Todas</MenuItem>
                <MenuItem value="Médio Completo">Médio Completo</MenuItem>
                <MenuItem value="Superior Completo">Superior Completo</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Renda</InputLabel>
              <Select value={filtros.renda} label="Renda" onChange={(e) => setFiltros({ ...filtros, renda: e.target.value })}>
                <MenuItem value="">Todas</MenuItem>
                <MenuItem value="Até 1 SM">Até 1 SM</MenuItem>
                <MenuItem value="2 a 5 SM">2 a 5 SM</MenuItem>
              </Select>
            </FormControl>
            <Button size="small" startIcon={<FilterListIcon />} variant="outlined">Filtrar</Button>
          </Box>
        </CardContent>
      </Card>

      {estatisticas && (
        <Box>
          <Chip label={`Total: ${estatisticas.total_entrevistados} entrevistados`} color="primary" size="small" sx={{ mb: 2 }} />

          {perguntas.map((p) => {
            const total = p.contagem.reduce((s, c) => s + Number(c.quantidade), 0)
            return (
              <Card key={p.pergunta_id} sx={{ mb: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                <CardContent sx={{ p: { xs: 1.5, sm: 2 }, '&:last-child': { pb: { xs: 1.5, sm: 2 } } }}>
                  <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>{p.titulo}</Typography>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', p: 0.75 }}>Respostas</TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', p: 0.75 }} align="right">N</TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', p: 0.75 }} align="right">%</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {p.contagem.map((c) => (
                        <TableRow key={c.valor}>
                          <TableCell sx={{ fontSize: '0.8rem', p: 0.75 }}>{c.valor}</TableCell>
                          <TableCell sx={{ fontSize: '0.8rem', p: 0.75 }} align="right">{c.quantidade}</TableCell>
                          <TableCell sx={{ fontSize: '0.8rem', p: 0.75 }} align="right">
                            {total > 0 ? `${((Number(c.quantidade) / total) * 100).toFixed(1)}%` : '-'}
                          </TableCell>
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
    </Box>
  )
}
