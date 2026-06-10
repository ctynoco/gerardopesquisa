import { useState, useEffect } from 'react'
import { Box, Typography, TextField, Button, Paper, Select, MenuItem, FormControl, InputLabel, Chip, IconButton, Divider } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import DragHandleIcon from '@mui/icons-material/DragHandle'
import SaveIcon from '@mui/icons-material/Save'
import api from '../services/api'

const tipos = [
  { value: 'unica_escolha', label: 'Única Escolha' },
  { value: 'multipla_escolha', label: 'Múltipla Escolha' },
  { value: 'aberta', label: 'Aberta' },
  { value: 'likert', label: 'Escala 1-5' },
  { value: 'numerica', label: 'Escala 1-10' },
]

export default function Questionario() {
  const [nome, setNome] = useState('')
  const [municipio, setMunicipio] = useState('')
  const [amostra, setAmostra] = useState('')
  const [perguntas, setPerguntas] = useState([])
  const [editando, setEditando] = useState({ titulo: '', tipo: 'unica_escolha', opcoes: '' })

  useEffect(() => {
    setPerguntas([
      { titulo: 'Se a eleição fosse hoje, em quem votaria?', tipo: 'unica_escolha', opcoes: ['Candidato A', 'Candidato B', 'Candidato C', 'Branco/Nulo', 'NS/NR'] },
    ])
  }, [])

  function adicionar() {
    if (!editando.titulo.trim()) return
    const p = { titulo: editando.titulo, tipo: editando.tipo }
    if (editando.opcoes && (editando.tipo === 'unica_escolha' || editando.tipo === 'multipla_escolha')) {
      p.opcoes = editando.opcoes.split(',').map((s) => s.trim())
    }
    setPerguntas((prev) => [...prev, p])
    setEditando({ titulo: '', tipo: 'unica_escolha', opcoes: '' })
  }

  function remover(idx) {
    setPerguntas((prev) => prev.filter((_, i) => i !== idx))
  }

  function subir(idx) {
    if (idx === 0) return
    setPerguntas((prev) => { const n = [...n]; [n[idx], n[idx - 1]] = [n[idx - 1], n[idx]]; return n })  }

  async function salvarQuestionario() {
    if (!nome.trim()) return alert('Informe o nome do questionário')
    const r = await api.post('/pesquisas', {
      titulo: nome, descricao: `Questionário: ${nome} | ${municipio} | Amostra: ${amostra}`,
      margem_erro: 3, nivel_confianca: 95, tamanho_amostra: Number(amostra) || null,
    })
    const pid = r.data?.pesquisa?.id || r.data?.id
    for (const p of perguntas) {
      await api.post('/perguntas', { pesquisa_id: pid, titulo: p.titulo, tipo: p.tipo, opcoes: p.opcoes || null, ordenacao: perguntas.indexOf(p) + 1 })
    }
    alert(`Questionário criado! ID: ${pid}`)
    setNome(''); setMunicipio(''); setAmostra(''); setPerguntas([{ titulo: 'Se a eleição fosse hoje, em quem votaria?', tipo: 'unica_escolha', opcoes: ['Candidato A', 'Candidato B', 'Candidato C', 'Branco/Nulo', 'NS/NR'] }])
  }

  return (
    <Box sx={{ maxWidth: 640, mx: 'auto' }}>
      <Typography variant="h1" sx={{ mb: 2, fontSize: { xs: '1.2rem', sm: '1.5rem' } }}>Criar Questionário</Typography>

      <Paper elevation={0} sx={{ p: { xs: 2, sm: 2.5 }, mb: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <TextField label="Nome do Questionário" value={nome} onChange={(e) => setNome(e.target.value)} size="small" fullWidth />
          <TextField label="Município" value={municipio} onChange={(e) => setMunicipio(e.target.value)} size="small" fullWidth />
          <TextField label="Amostra (tamanho)" type="number" value={amostra} onChange={(e) => setAmostra(e.target.value)} size="small" fullWidth />
        </Box>
      </Paper>

      <Typography variant="h2" sx={{ fontSize: '0.9rem', mb: 1.5 }}>Perguntas do Questionário ({perguntas.length})</Typography>

      <Paper elevation={0} sx={{ p: { xs: 2, sm: 2.5 }, mb: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <TextField label="Título da pergunta" value={editando.titulo} onChange={(e) => setEditando({ ...editando, titulo: e.target.value })} size="small" fullWidth />
          <FormControl size="small" fullWidth>
            <InputLabel>Tipo</InputLabel>
            <Select value={editando.tipo} label="Tipo" onChange={(e) => setEditando({ ...editando, tipo: e.target.value })}>
              {tipos.map((t) => <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>)}
            </Select>
          </FormControl>
          {(editando.tipo === 'unica_escolha' || editando.tipo === 'multipla_escolha') && (
            <TextField label="Opções (separadas por vírgula)" value={editando.opcoes} onChange={(e) => setEditando({ ...editando, opcoes: e.target.value })} size="small" fullWidth />
          )}
          <Button variant="outlined" startIcon={<AddIcon />} onClick={adicionar} disabled={!editando.titulo.trim()} sx={{ borderRadius: 2 }}>
            Adicionar Pergunta
          </Button>
        </Box>
      </Paper>

      {perguntas.map((p, i) => (
        <Paper key={i} elevation={0} sx={{ p: 1.5, mb: 1, border: '1px solid', borderColor: 'divider', borderRadius: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <DragHandleIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body2" fontWeight={500}>{i + 1}. {p.titulo}</Typography>
            <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5, flexWrap: 'wrap' }}>
              <Chip label={p.tipo} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.65rem' }} />
              {p.opcoes && <Chip label={`${p.opcoes.length} opts`} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.65rem' }} />}
            </Box>
          </Box>
          <IconButton size="small" onClick={() => remover(i)} color="error"><DeleteIcon fontSize="small" /></IconButton>
        </Paper>
      ))}

      {perguntas.length > 0 && (
        <Button variant="contained" startIcon={<SaveIcon />} onClick={salvarQuestionario} fullWidth sx={{ mt: 2, py: 1.5, borderRadius: 2 }}>
          Salvar Questionário
        </Button>
      )}
    </Box>
  )
}
