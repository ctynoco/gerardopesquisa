import { useState, useEffect } from 'react'
import { Box, Typography, Button, TextField, Select, MenuItem, FormControl, InputLabel, Dialog, DialogTitle, DialogContent, DialogActions, Chip, IconButton, Tooltip } from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'
import { ptBR } from '@mui/x-data-grid/locales'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import ConfirmDialog from '../components/ConfirmDialog'
import api from '../services/api'

const tipos = ['texto', 'multipla_escolha', 'unica_escolha', 'numerica', 'data', 'likert', 'aberta']

export default function Perguntas() {
  const [perguntas, setPerguntas] = useState([])
  const [pesquisas, setPesquisas] = useState([])
  const [pesquisaId, setPesquisaId] = useState('')
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ pesquisa_id: '', tipo: 'texto', titulo: '', opcoes: '' })
  const [confirmDelete, setConfirmDelete] = useState(null)

  useEffect(() => { load() }, [])
  useEffect(() => { loadPerguntas() }, [pesquisaId])

  async function load() {
    try { const res = await api.get('/pesquisas?limit=100'); setPesquisas(res.data.pesquisas) } catch (err) { console.error('Erro ao carregar', err) }
  }

  async function loadPerguntas() {
    try {
      const params = pesquisaId ? `?pesquisa_id=${pesquisaId}` : ''
      const res = await api.get(`/perguntas${params}`)
      setPerguntas(res.data.perguntas)
    } catch (err) { console.error('Erro ao carregar perguntas', err) }
  }

  async function criar(e) {
    e.preventDefault()
    try {
      const body = { ...form }
      if (body.opcoes) body.opcoes = body.opcoes.split(',').map((s) => s.trim())
      else delete body.opcoes
      await api.post('/perguntas', body)
      setOpen(false)
      setForm({ pesquisa_id: '', tipo: 'texto', titulo: '', opcoes: '' })
      loadPerguntas()
    } catch (err) { console.error('Erro ao criar pergunta', err) }
  }

  async function remover() {
    if (!confirmDelete) return
    try { await api.delete(`/perguntas/${confirmDelete}`); setConfirmDelete(null); loadPerguntas() } catch (err) { console.error('Erro ao remover', err); setConfirmDelete(null) }
  }

  const columns = [
    { field: 'titulo', headerName: 'Pergunta', flex: 1 },
    { field: 'tipo', headerName: 'Tipo', width: 160, renderCell: ({ value }) => <Chip label={value} size="small" variant="outlined" /> },
    { field: 'opcoes', headerName: 'Opções', flex: 1, valueFormatter: (v) => v ? v.join(', ') : '-' },
    { field: 'actions', headerName: 'Ações', width: 100, sortable: false, renderCell: ({ row }) => (
      <Tooltip title="Remover"><IconButton size="small" onClick={() => setConfirmDelete(row.id)}><DeleteIcon fontSize="small" color="error" /></IconButton></Tooltip>
    )},
  ]

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h1" sx={{ mb: 0 }}>Biblioteca de Perguntas</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)}>Nova Pergunta</Button>
      </Box>

      <FormControl size="small" sx={{ mb: 2, minWidth: 250 }}>
        <InputLabel>Filtrar por pesquisa</InputLabel>
        <Select value={pesquisaId} label="Filtrar por pesquisa" onChange={(e) => setPesquisaId(e.target.value)}>
          <MenuItem value="">Todas as pesquisas</MenuItem>
          {pesquisas.map((p) => <MenuItem key={p.id} value={p.id}>{p.titulo}</MenuItem>)}
        </Select>
      </FormControl>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <Box component="form" onSubmit={criar}>
          <DialogTitle>Nova Pergunta</DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
            <FormControl size="small" fullWidth required>
              <InputLabel>Pesquisa</InputLabel>
              <Select value={form.pesquisa_id} label="Pesquisa" onChange={(e) => setForm({...form, pesquisa_id: e.target.value})}>
                {pesquisas.map((p) => <MenuItem key={p.id} value={p.id}>{p.titulo}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl size="small" fullWidth>
              <InputLabel>Tipo</InputLabel>
              <Select value={form.tipo} label="Tipo" onChange={(e) => setForm({...form, tipo: e.target.value})}>
                {tipos.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
              </Select>
            </FormControl>
            <TextField label="Título da pergunta" value={form.titulo} onChange={(e) => setForm({...form, titulo: e.target.value})} required size="small" fullWidth />
            <TextField label="Opções (separadas por vírgula)" value={form.opcoes} onChange={(e) => setForm({...form, opcoes: e.target.value})} size="small" fullWidth />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" variant="contained">Salvar</Button>
          </DialogActions>
        </Box>
      </Dialog>

      <DataGrid rows={perguntas} columns={columns} pageSizeOptions={[10, 25, 50]} getRowId={(r) => r.id} autoHeight disableRowSelectionOnClick density="comfortable" localeText={ptBR.components.MuiDataGrid.defaultProps.localeText} sx={{ border: 0 }} />

      <ConfirmDialog
        open={!!confirmDelete}
        title="Remover pergunta"
        message="Tem certeza que deseja remover esta pergunta? Todas as respostas associadas serão perdidas."
        onConfirm={remover}
        onCancel={() => setConfirmDelete(null)}
        confirmText="Remover"
      />
    </Box>
  )
}
