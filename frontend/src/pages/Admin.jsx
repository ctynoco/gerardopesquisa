import { useState, useEffect } from 'react'
import api from '../services/api'

export default function Admin() {
  const [aba, setAba] = useState('usuarios')
  const [usuarios, setUsuarios] = useState([])
  const [auditoria, setAuditoria] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ nome: '', email: '', senha: '', perfil: 'entrevistador' })
  const [editando, setEditando] = useState(null)

  useEffect(() => { carregarUsuarios(); carregarAuditoria() }, [])

  async function carregarUsuarios() {
    try {
      const res = await api.get('/usuarios')
      setUsuarios(res.data.usuarios)
    } catch {}
  }

  async function carregarAuditoria() {
    try {
      const res = await api.get('/auditoria')
      setAuditoria(res.data.auditoria)
    } catch {}
  }

  async function salvar(e) {
    e.preventDefault()
    try {
      if (editando) {
        await api.put(`/usuarios/${editando}`, { nome: form.nome, email: form.email, perfil: form.perfil })
      } else {
        await api.post('/usuarios', form)
      }
      setShowForm(false)
      setEditando(null)
      setForm({ nome: '', email: '', senha: '', perfil: 'entrevistador' })
      carregarUsuarios()
    } catch (err) {
      alert(err.response?.data?.error || 'Erro ao salvar')
    }
  }

  function editar(u) {
    setEditando(u.id)
    setForm({ nome: u.nome, email: u.email, senha: '', perfil: u.perfil })
    setShowForm(true)
  }

  async function alternarAtivo(u) {
    await api.put(`/usuarios/${u.id}`, { ...u, ativo: !u.ativo })
    carregarUsuarios()
  }

  async function remover(id) {
    if (!confirm('Remover usuário?')) return
    try {
      await api.delete(`/usuarios/${id}`)
      carregarUsuarios()
    } catch (err) {
      alert(err.response?.data?.error || 'Erro ao remover')
    }
  }

  return (
    <div>
      <h1>Administração</h1>
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <button className={`btn ${aba === 'usuarios' ? 'btn-primary' : ''}`} onClick={() => setAba('usuarios')}>Usuários</button>
        <button className={`btn ${aba === 'auditoria' ? 'btn-primary' : ''}`} onClick={() => setAba('auditoria')}>Auditoria</button>
      </div>

      {aba === 'usuarios' && (
        <>
          <div className="page-header">
            <h2 style={{ fontSize: 18, margin: 0 }}>Gerenciar Usuários</h2>
            <button className="btn" onClick={() => { setShowForm(true); setEditando(null); setForm({ nome: '', email: '', senha: '', perfil: 'entrevistador' }) }}>
              Novo Usuário
            </button>
          </div>

          {showForm && (
            <form className="form" onSubmit={salvar}>
              <input placeholder="Nome" value={form.nome} onChange={(e) => setForm({...form, nome: e.target.value})} required />
              <input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} required />
              {!editando && <input type="password" placeholder="Senha" value={form.senha} onChange={(e) => setForm({...form, senha: e.target.value})} required />}
              <select value={form.perfil} onChange={(e) => setForm({...form, perfil: e.target.value})}>
                <option value="entrevistador">Entrevistador</option>
                <option value="admin">Admin</option>
              </select>
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="submit" className="btn btn-primary">{editando ? 'Atualizar' : 'Criar'}</button>
                <button type="button" className="btn" onClick={() => { setShowForm(false); setEditando(null) }}>Cancelar</button>
              </div>
            </form>
          )}

          <table>
            <thead><tr><th>Nome</th><th>Email</th><th>Perfil</th><th>Status</th><th>Ações</th></tr></thead>
            <tbody>
              {usuarios.map((u) => (
                <tr key={u.id}>
                  <td>{u.nome}</td>
                  <td>{u.email}</td>
                  <td><span className="badge">{u.perfil}</span></td>
                  <td><span className={`status ${u.ativo ? 'status-ativa' : 'status-rascunho'}`}>{u.ativo ? 'Ativo' : 'Inativo'}</span></td>
                  <td style={{ display: 'flex', gap: 4 }}>
                    <button className="btn" onClick={() => editar(u)}>Editar</button>
                    <button className="btn" onClick={() => alternarAtivo(u)}>{u.ativo ? 'Desativar' : 'Ativar'}</button>
                    <button className="btn btn-danger" onClick={() => remover(u.id)}>Remover</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {aba === 'auditoria' && (
        <>
          <h2 style={{ fontSize: 18 }}>Log de Auditoria</h2>
          <table>
            <thead><tr><th>Data</th><th>Usuário</th><th>Ação</th><th>Entidade</th></tr></thead>
            <tbody>
              {auditoria.map((a) => (
                <tr key={a.id}>
                  <td>{new Date(a.created_at).toLocaleString('pt-BR')}</td>
                  <td>{a.usuario_nome || '-'}</td>
                  <td>{a.acao}</td>
                  <td>{a.entidade} #{a.entidade_id || ''}</td>
                </tr>
              ))}
              {!auditoria.length && <tr><td colSpan={4} style={{ textAlign: 'center', color: '#94a3b8' }}>Nenhum registro de auditoria</td></tr>}
            </tbody>
          </table>
        </>
      )}
    </div>
  )
}
