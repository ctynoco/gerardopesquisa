import { useState } from 'react'
import { Box, Typography, Card, CardContent, Chip, Accordion, AccordionSummary, AccordionDetails, TextField, InputAdornment, Button } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import AddIcon from '@mui/icons-material/Add'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import modelos from '../data/modelosPerguntas'

export default function Biblioteca() {
  const [busca, setBusca] = useState('')
  const [expanded, setExpanded] = useState('Perfil')

  const filtrados = modelos.map((cat) => ({
    ...cat,
    perguntas: cat.perguntas.filter((p) => p.titulo.toLowerCase().includes(busca.toLowerCase())),
  })).filter((cat) => cat.perguntas.length > 0)

  function copiar(p) {
    navigator.clipboard?.writeText(JSON.stringify({ titulo: p.titulo, tipo: p.tipo, opcoes: p.opcoes }, null, 2))
  }

  return (
    <Box>
      <Typography variant="h1" sx={{ mb: 2, fontSize: { xs: '1.2rem', sm: '1.5rem' } }}>Biblioteca de Perguntas</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{modelos.reduce((s, c) => s + c.perguntas.length, 0)} modelos disponíveis</Typography>

      <TextField
        placeholder="Buscar perguntas..." value={busca} onChange={(e) => setBusca(e.target.value)} size="small" fullWidth
        InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
        sx={{ mb: 2, '& .MuiInputBase-root': { borderRadius: 2 } }}
      />

      {filtrados.map((cat) => (
        <Accordion key={cat.categoria} expanded={expanded === cat.categoria} onChange={() => setExpanded(expanded === cat.categoria ? '' : cat.categoria)} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '8px !important', mb: 1, '&:before': { display: 'none' } }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="body2" fontWeight={600}>{cat.categoria} <Chip label={cat.perguntas.length} size="small" sx={{ ml: 1 }} /></Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ pt: 0 }}>
            {cat.perguntas.map((p) => (
              <Box key={p.titulo} sx={{ p: 1.5, mb: 1, backgroundColor: 'action.hover', borderRadius: 1.5, '&:last-child': { mb: 0 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1 }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" fontWeight={500}>{p.titulo}</Typography>
                    <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5, flexWrap: 'wrap' }}>
                      <Chip label={p.tipo} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.65rem' }} />
                      {p.opcoes && <Chip label={`${p.opcoes.length} opções`} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.65rem' }} />}
                    </Box>
                  </Box>
                  <Button size="small" variant="outlined" startIcon={<ContentCopyIcon />} onClick={() => copiar(p)} sx={{ fontSize: '0.7rem', py: 0.3, flexShrink: 0 }}>
                    Copiar
                  </Button>
                </Box>
              </Box>
            ))}
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  )
}
