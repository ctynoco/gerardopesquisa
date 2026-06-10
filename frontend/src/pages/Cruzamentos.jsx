import { useState, useEffect } from 'react'
import { Box, Typography, Card, CardContent, FormControl, InputLabel, Select, MenuItem, Table, TableHead, TableBody, TableRow, TableCell, Chip, Button } from '@mui/material'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import MergeTypeIcon from '@mui/icons-material/MergeType'
import api from '../services/api'

export default function Cruzamentos() {
  const [pesquisas, setPesquisas] = useState([])
  const [pesquisaId, setPesquisaId] = useState('')
  const [agruparPor, setAgruparPor] = useState('genero')
  const [dados, setDados] = useState(null)

  useEffect(() => { api.get('/pesquisas?limit=100').then((r) => setPesquisas(r.data.pesquisas)) }, [])

  async function carregar() {
    const r = await api.get(`/cruzamentos/${pesquisaId}?agrupar_por=${agruparPor}`)
    setDados(r.data)
  }

  return (
    <Box>
      <Typography variant="h1" sx={{ mb: 2, fontSize: { xs: '1.2rem', sm: '1.5rem' } }}>Cruzamentos</Typography>

      <Card sx={{ mb: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
        <CardContent sx={{ p: { xs: 1.5, sm: 2 }, '&:last-child': { pb: { xs: 1.5, sm: 2 } } }}>
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 250 } }}>
              <InputLabel>Pesquisa</InputLabel>
              <Select value={pesquisaId} label="Pesquisa" onChange={(e) => setPesquisaId(e.target.value)}>
                {pesquisas.map((p) => <MenuItem key={p.id} value={p.id}>{p.titulo}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 200 } }}>
              <InputLabel>Agrupar por</InputLabel>
              <Select value={agruparPor} label="Agrupar por" onChange={(e) => setAgruparPor(e.target.value)}>
                <MenuItem value="genero">Sexo</MenuItem>
                <MenuItem value="escolaridade">Escolaridade</MenuItem>
                <MenuItem value="renda_familiar">Renda</MenuItem>
                <MenuItem value="cidade">Cidade</MenuItem>
              </Select>
            </FormControl>
            <Button variant="contained" disabled={!pesquisaId} startIcon={<PlayArrowIcon />} onClick={carregar}>Calcular</Button>
          </Box>
        </CardContent>
      </Card>

      {dados && (
        <Box>
          <Chip icon={<MergeTypeIcon />} label={`${dados.total_entrevistados} entrevistados | Cruzamento por ${dados.agrupado_por}`} color="primary" size="small" sx={{ mb: 2 }} />

          {dados.perguntas.map((p) => (
            <Card key={p.pergunta_id} sx={{ mb: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
              <CardContent sx={{ p: { xs: 1.5, sm: 2 }, '&:last-child': { pb: { xs: 1.5, sm: 2 } } }}>
                <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>{p.titulo}</Typography>
                <Box sx={{ overflowX: 'auto' }}>
                  <Table size="small" sx={{ minWidth: 300 }}>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', p: 0.75, whiteSpace: 'nowrap' }}>Resposta</TableCell>
                        {p.grupos.map((g) => (
                          <TableCell key={g} sx={{ fontWeight: 600, fontSize: '0.75rem', p: 0.75, textAlign: 'right', whiteSpace: 'nowrap' }}>{g}</TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {p.linhas.map((linha) => {
                        const totalLinha = p.grupos.reduce((s, g) => s + (linha[g] || 0), 0)
                        return (
                          <TableRow key={linha.valor}>
                            <TableCell sx={{ fontSize: '0.8rem', p: 0.75 }}>{linha.valor}</TableCell>
                            {p.grupos.map((g) => (
                              <TableCell key={g} sx={{ fontSize: '0.8rem', p: 0.75, textAlign: 'right' }}>
                                {totalLinha > 0 && linha[g] ? `${((linha[g] / totalLinha) * 100).toFixed(1)}%` : '-'}
                              </TableCell>
                            ))}
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
    </Box>
  )
}
