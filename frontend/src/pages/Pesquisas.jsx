import { useState, useEffect } from 'react'
import api from '../services/api'

export default function Pesquisas() {
  const [pesquisas, setPesquisas] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ titulo: '', descricao: '', margem_erro: '', nivel_confianca: '' })

  useEffect(() => { load() }, [])

  async function load() {
    const res = await api.get('/pesquisas')
    setPesquisas(res.data.pesquisas)
  }

  async function criar(e) {
    e.preventDefault()
    await api.post('/pesquisas', form)
    setShowForm(false)
    setForm({ titulo: '', descricao: '', margem_erro: '', nivel_confianca: '' })
    load()
  }

  async function remover(id) {
    if (!confirm('Remover pesquisa?')) return
    await api.delete(`/pesquisas/${id}`)
    load()
  }

  const statusLabel = { rascunho: 'Rascunho', ativa: 'Ativa', concluida: 'Concluída' }

  return (
    <div>
      <div className="page-header">
        <h1>Pesquisas</h1>
        <button className="btn" onClick={() => setShowForm(!showForm)}>Nova Pesquisa</button>
      </div>
      {showForm && (
        <form className="form" onSubmit={criar}>
          <input placeholder="Título" value={form.titulo} onChange={(e) => setForm({...form, titulo: e.target.value})} required />
          <input placeholder="Descrição" value={form.descricao} onChange={(e) => setForm({...form, descricao: e.target.value})} />
          <div className="form-row">
            <input type="number" step="0.1" placeholder="Margem de erro (%)" value={form.margem_erro} onChange={(e) => setForm({...form, margem_erro: e.target.value})} />
            <input type="number" step="0.1" placeholder="Nível de confiança (%)" value={form.nivel_confianca} onChange={(e) => setForm({...form, nivel_confianca: e.target.value})} />
          </div>
          <button type="submit" className="btn btn-primary">Salvar</button>
        </form>
      )}
      <table>
        <thead><tr><th>Título</th><th>Status</th><th>Entrevistados</th><th>Criador</th><th>Ações</th></tr></thead>
        <tbody>
          {pesquisas.map((p) => (
            <tr key={p.id}>
              <td>{p.titulo}</td>
              <td><span className={`status status-${p.status}`}>{statusLabel[p.status] || p.status}</span></td>
              <td>{p.total_entrevistados || 0}</td>
              <td>{p.criador}</td>
              <td><button className="btn btn-danger" onClick={() => remover(p.id)}>Remover</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
