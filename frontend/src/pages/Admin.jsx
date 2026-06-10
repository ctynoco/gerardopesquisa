import { useState, useEffect } from 'react'
import { Box, Typography, Tabs, Tab, Button, TextField, Select, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, Chip, IconButton, Tooltip } from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'
import { ptBR } from '@mui/x-data-grid/locales'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import BlockIcon from '@mui/icons-material/Block'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import DeleteIcon from '@mui/icons-material/Delete'
import api from '../services/api'

export default function Admin() {
  const [aba, setAba] = useState(0)
  const [usuarios, setUsuarios] = useState([])
  const [auditoria, setAuditoria] = useState([])
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ nome: '', telefone: '', senha: '', perfil: 'entrevistador' })
  const [editando, setEditando] = useState(null)

  useEffect(() => { carregarUsuarios(); carregarAuditoria() }, [])

  async function carregarUsuarios() {
    try { const r = await api.get('/usuarios'); setUsuarios(r.data.usuarios) } catch {}
  }

  async function carregarAuditoria() {
    try { const r = await api.get('/auditoria'); setAuditoria(r.data.auditoria) } catch {}
  }

  async function salvar(e) {
    e.preventDefault()
    try {
      if (editando) {
        await api.put(`/usuarios/${editando}`, { nome: form.nome, telefone: form.telefone, perfil: form.perfil })
      } else {
        await api.post('/usuarios', form)
      }
      setOpen(false)
      setEditando(null)
      setForm({ nome: '', telefone: '', senha: '', perfil: 'entrevistador' })
      carregarUsuarios()
    } catch (err) {
      alert(err.response?.data?.error || 'Erro ao salvar')
    }
  }

  function editar(u) {
    setEditando(u.id)
    setForm({ nome: u.nome, telefone: u.telefone, senha: '', perfil: u.perfil })
    setOpen(true)
  }

  async function alternarAtivo(u) {
    await api.put(`/usuarios/${u.id}`, { ...u, ativo: !u.ativo })
    carregarUsuarios()
  }

  async function remover(id) {
    if (!window.confirm('Remover usuário?')) return
    try { await api.delete(`/usuarios/${id}`); carregarUsuarios() } catch (err) { alert(err.response?.data?.error || 'Erro ao remover') }
  }

  const colUsuarios = [
    { field: 'nome', headerName: 'Nome', flex: 1 },
    { field: 'telefone', headerName: 'Telefone', width: 150 },
    { field: 'perfil', headerName: 'Perfil', width: 140, renderCell: ({ value }) => <Chip label={value} size="small" color={value === 'admin' ? 'primary' : 'default'} variant="outlined" /> },
    { field: 'ativo', headerName: 'Status', width: 100, renderCell: ({ value }) => <Chip label={value ? 'Ativo' : 'Inativo'} size="small" color={value ? 'success' : 'default'} /> },
    { field: 'actions', headerName: 'Ações', width: 200, sortable: false, renderCell: ({ row }) => (
      <Box sx={{ display: 'flex', gap: 0.5 }}>
        <Tooltip title="Editar"><IconButton size="small" onClick={() => editar(row)}><EditIcon fontSize="small" /></IconButton></Tooltip>
        <Tooltip title={row.ativo ? 'Desativar' : 'Ativar'}><IconButton size="small" onClick={() => alternarAtivo(row)}>{row.ativo ? <BlockIcon fontSize="small" color="warning" /> : <CheckCircleIcon fontSize="small" color="success" />}</IconButton></Tooltip>
        <Tooltip title="Remover"><IconButton size="small" onClick={() => remover(row.id)}><DeleteIcon fontSize="small" color="error" /></IconButton></Tooltip>
      </Box>
    )},
  ]

  const colAuditoria = [
    { field: 'created_at', headerName: 'Data', width: 180, valueFormatter: (v) => v ? new Date(v).toLocaleString('pt-BR') : '' },
    { field: 'usuario_nome', headerName: 'Usuário', flex: 1, valueFormatter: (v) => v || '-' },
    { field: 'acao', headerName: 'Ação', width: 120 },
    { field: 'entidade', headerName: 'Entidade', width: 180, renderCell: ({ row }) => `${row.entidade} #${row.entidade_id || ''}` },
  ]

  return (
    <Box>
      <Typography variant="h1" sx={{ mb: 2 }}>Administração</Typography>

      <Tabs value={aba} onChange={(_, v) => setAba(v)} sx={{ mb: 2 }}>
        <Tab label="Usuários" />
        <Tab label="Auditoria" />
      </Tabs>

      {aba === 0 && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h2">Gerenciar Usuários</Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setOpen(true); setEditando(null); setForm({ nome: '', telefone: '', senha: '', perfil: 'entrevistador' }) }}>
              Novo Usuário
            </Button>
          </Box>

          <DataGrid rows={usuarios} columns={colUsuarios} pageSizeOptions={[10, 25, 50]} getRowId={(r) => r.id} autoHeight disableRowSelectionOnClick density="comfortable" localeText={ptBR.components.MuiDataGrid.defaultProps.localeText} sx={{ border: 0 }} />

          <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>
            <Box component="form" onSubmit={salvar}>
              <DialogTitle>{editando ? 'Editar Usuário' : 'Novo Usuário'}</DialogTitle>
              <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
                <TextField label="Nome" value={form.nome} onChange={(e) => setForm({...form, nome: e.target.value})} required size="small" fullWidth />
                <TextField label="Telefone" type="tel" value={form.telefone} onChange={(e) => setForm({...form, telefone: e.target.value})} required size="small" fullWidth />
                {!editando && <TextField label="Senha" type="password" value={form.senha} onChange={(e) => setForm({...form, senha: e.target.value})} required size="small" fullWidth />}
                <Select value={form.perfil} onChange={(e) => setForm({...form, perfil: e.target.value})} size="small" fullWidth>
                  <MenuItem value="entrevistador">Entrevistador</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                </Select>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setOpen(false)}>Cancelar</Button>
                <Button type="submit" variant="contained">{editando ? 'Atualizar' : 'Criar'}</Button>
              </DialogActions>
            </Box>
          </Dialog>
        </Box>
      )}

      {aba === 1 && (
        <Box>
          <Typography variant="h2" sx={{ mb: 2 }}>Log de Auditoria</Typography>
          <DataGrid rows={auditoria} columns={colAuditoria} pageSizeOptions={[10, 25, 50]} getRowId={(r) => r.id} autoHeight disableRowSelectionOnClick density="compact" localeText={ptBR.components.MuiDataGrid.defaultProps.localeText} sx={{ border: 0 }} />
        </Box>
      )}
    </Box>
  )
}
