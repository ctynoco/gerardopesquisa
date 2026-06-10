import { useState, useEffect } from 'react'
import { Box, Typography, Card, CardContent, FormControl, InputLabel, Select, MenuItem, Table, TableHead, TableBody, TableRow, TableCell, Chip, Button } from '@mui/material'
import FilterListIcon from '@mui/icons-material/FilterList'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import api from '../services/api'

export default function Tabulacao() {
  const [pesquisas, setPesquisas] = useState([])
  const [pesquisaId, setPesquisaId] = useState('')
  const [estatisticas, setEstatisticas] = useState(null)
  const [filtros, setFiltros] = useState({ genero: '', idade: '', escolaridade: '', renda: '' })

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
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel>Sexo</InputLabel>
              <Select value={filtros.genero} label="Sexo" onChange={(e) => setFiltros({ ...filtros, genero: e.target.value })}>
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="Masculino">Masculino</MenuItem>
                <MenuItem value="Feminino">Feminino</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel>Idade</InputLabel>
              <Select value={filtros.idade} label="Idade" onChange={(e) => setFiltros({ ...filtros, idade: e.target.value })}>
                <MenuItem value="">Todas</MenuItem>
                <MenuItem value="16 a 24 anos">16 a 24 anos</MenuItem>
                <MenuItem value="25 a 34 anos">25 a 34 anos</MenuItem>
                <MenuItem value="35 a 44 anos">35 a 44 anos</MenuItem>
                <MenuItem value="45 a 59 anos">45 a 59 anos</MenuItem>
                <MenuItem value="60 anos ou mais">60 anos ou mais</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel>Escolaridade</InputLabel>
              <Select value={filtros.escolaridade} label="Escolaridade" onChange={(e) => setFiltros({ ...filtros, escolaridade: e.target.value })}>
                <MenuItem value="">Todas</MenuItem>
                <MenuItem value="Fundamental Incompleto">Fundamental Incompleto</MenuItem>
                <MenuItem value="Fundamental Completo">Fundamental Completo</MenuItem>
                <MenuItem value="Médio Incompleto">Médio Incompleto</MenuItem>
                <MenuItem value="Médio Completo">Médio Completo</MenuItem>
                <MenuItem value="Superior Incompleto">Superior Incompleto</MenuItem>
                <MenuItem value="Superior Completo">Superior Completo</MenuItem>
                <MenuItem value="Pós-graduação">Pós-graduação</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel>Renda</InputLabel>
              <Select value={filtros.renda} label="Renda" onChange={(e) => setFiltros({ ...filtros, renda: e.target.value })}>
                <MenuItem value="">Todas</MenuItem>
                <MenuItem value="Até 1 SM">Até 1 SM</MenuItem>
                <MenuItem value="1 a 2 SM">1 a 2 SM</MenuItem>
                <MenuItem value="2 a 5 SM">2 a 5 SM</MenuItem>
                <MenuItem value="5 a 10 SM">5 a 10 SM</MenuItem>
                <MenuItem value="Acima de 10 SM">Acima de 10 SM</MenuItem>
              </Select>
            </FormControl>
            <Button size="small" startIcon={<FilterListIcon />} variant="outlined" sx={{ height: 36 }}>Filtrar</Button>
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
