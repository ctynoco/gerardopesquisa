import { useState, useEffect } from 'react'
import { Box, Typography, Card, CardContent, FormControl, InputLabel, Select, MenuItem, Button, Chip, IconButton, Tooltip, TextField } from '@mui/material'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import MyLocationIcon from '@mui/icons-material/MyLocation'
import { MapContainer, TileLayer, CircleMarker, Tooltip as LeafletTooltip } from 'react-leaflet'
import api from '../services/api'
import 'leaflet/dist/leaflet.css'

export default function Georreferenciamento() {
  const [pesquisas, setPesquisas] = useState([])
  const [pesquisaId, setPesquisaId] = useState('')
  const [dados, setDados] = useState(null)
  const [total, setTotal] = useState(0)

  useEffect(() => { api.get('/pesquisas?limit=100').then((r) => setPesquisas(r.data.pesquisas)) }, [])

  async function carregar() {
    if (!pesquisaId) return
    const [geoRes, totalRes] = await Promise.all([
      api.get(`/geografico/mapa/${pesquisaId}`),
      api.get(`/entrevistados?pesquisa_id=${pesquisaId}&limit=1&page=1`),
    ])
    setDados(geoRes.data)
    setTotal(Number(totalRes.headers['x-total-count']) || 0)
  }

  const comCoordenadas = (dados?.bairros || []).filter((b) => b.latitude && b.longitude)
  const semCoordenadas = (dados?.bairros || []).filter((b) => !b.latitude || !b.longitude)

  return (
    <Box>
      <Typography variant="h1" sx={{ mb: 2, fontSize: { xs: '1.2rem', sm: '1.5rem' } }}>Georreferenciamento por Bairro</Typography>

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
          <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
            <Chip label={`${total} entrevistados`} color="primary" size="small" />
            <Chip label={`${comCoordenadas.length} bairros no mapa`} color="success" variant="outlined" size="small" />
            {semCoordenadas.length > 0 && (
              <Chip label={`${semCoordenadas.length} bairros sem coordenadas`} color="warning" variant="outlined" size="small" />
            )}
          </Box>

          <Card sx={{ mb: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
            <Box sx={{ height: { xs: 350, sm: 500 }, width: '100%' }}>
              {comCoordenadas.length > 0 ? (
                <MapContainer center={[-3.875, -38.625]} zoom={13} style={{ height: '100%', width: '100%' }}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  {comCoordenadas.map((b, i) => {
                    const maxCount = Math.max(...comCoordenadas.map((x) => x.quantidade), 1)
                    const radius = 8 + (b.quantidade / maxCount) * 32
                    const pct = (b.quantidade / total) * 100
                    return (
                      <CircleMarker key={i} center={[Number(b.latitude), Number(b.longitude)]} radius={radius} pathOptions={{ color: '#1976d2', fillColor: '#1976d2', fillOpacity: 0.4, weight: 2 }}>
                        <LeafletTooltip direction="top" offset={[0, -radius]}>
                          <strong>{b.bairro}</strong><br />
                          {b.quantidade} entrevistados ({pct.toFixed(1)}%)
                        </LeafletTooltip>
                      </CircleMarker>
                    )
                  })}
                </MapContainer>
              ) : (
                <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'text.secondary' }}>
                  Nenhum bairro com coordenadas cadastradas
                </Box>
              )}
            </Box>
          </Card>

          {semCoordenadas.length > 0 && (
            <Box>
              <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>Bairros sem coordenadas — cadastre no backend:</Typography>
              {semCoordenadas.map((b, i) => (
                <Typography key={i} variant="caption" display="block" sx={{ mb: 0.25 }}>• {b.bairro} ({b.quantidade} entrev.)</Typography>
              ))}
            </Box>
          )}
        </Box>
      )}
    </Box>
  )
}
