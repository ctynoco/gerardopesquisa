import { useState, useEffect } from 'react'
import { Box, Typography, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Chip, IconButton, Tooltip } from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'
import { ptBR } from '@mui/x-data-grid/locales'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import api from '../services/api'

export default function Pesquisas() {
  const [pesquisas, setPesquisas] = useState([])
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ titulo: '', descricao: '', margem_erro: '', nivel_confianca: '' })

  useEffect(() => { load() }, [])

  async function load() {
    const res = await api.get('/pesquisas')
    setPesquisas(res.data.pesquisas)
  }

  async function criar(e) {
    e.preventDefault()
    await api.post('/pesquisas', form)
    setOpen(false)
    setForm({ titulo: '', descricao: '', margem_erro: '', nivel_confianca: '' })
    load()
  }

  async function remover(id) {
    if (!window.confirm('Remover pesquisa?')) return
    await api.delete(`/pesquisas/${id}`)
    load()
  }

  const statusLabel = { rascunho: 'Rascunho', ativa: 'Ativa', concluida: 'Concluída' }

  const columns = [
    { field: 'titulo', headerName: 'Título', flex: 1 },
    { field: 'status', headerName: 'Status', width: 120, renderCell: ({ value }) => {
      const colors = { rascunho: 'warning', ativa: 'info', concluida: 'success' }
      return <Chip label={statusLabel[value] || value} size="small" color={colors[value] || 'default'} />
    }},
    { field: 'total_entrevistados', headerName: 'Entrevistados', width: 140, valueFormatter: (v) => v || 0 },
    { field: 'criador', headerName: 'Criador', width: 150 },
    { field: 'actions', headerName: 'Ações', width: 100, sortable: false, renderCell: ({ row }) => (
      <Tooltip title="Remover"><IconButton size="small" onClick={() => remover(row.id)}><DeleteIcon fontSize="small" color="error" /></IconButton></Tooltip>
    )},
  ]

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h1" sx={{ mb: 0 }}>Pesquisas</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)}>Nova Pesquisa</Button>
      </Box>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <Box component="form" onSubmit={criar}>
          <DialogTitle>Nova Pesquisa</DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
            <TextField label="Título" value={form.titulo} onChange={(e) => setForm({...form, titulo: e.target.value})} required size="small" fullWidth />
            <TextField label="Descrição" value={form.descricao} onChange={(e) => setForm({...form, descricao: e.target.value})} size="small" fullWidth multiline rows={2} />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField label="Margem de erro (%)" type="number" value={form.margem_erro} onChange={(e) => setForm({...form, margem_erro: e.target.value})} size="small" fullWidth />
              <TextField label="Nível de confiança (%)" type="number" value={form.nivel_confianca} onChange={(e) => setForm({...form, nivel_confianca: e.target.value})} size="small" fullWidth />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" variant="contained">Salvar</Button>
          </DialogActions>
        </Box>
      </Dialog>

      <DataGrid rows={pesquisas} columns={columns} pageSizeOptions={[10, 25, 50]} getRowId={(r) => r.id} autoHeight disableRowSelectionOnClick density="comfortable" localeText={ptBR.components.MuiDataGrid.defaultProps.localeText} sx={{ border: 0 }} />
    </Box>
  )
}
