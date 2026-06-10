import { useState, useEffect } from 'react'
import api from '../services/api'

const tipos = ['texto', 'multipla_escolha', 'unica_escolha', 'numerica', 'data', 'likert', 'aberta']

export default function Perguntas() {
  const [perguntas, setPerguntas] = useState([])
  const [pesquisas, setPesquisas] = useState([])
  const [pesquisaId, setPesquisaId] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ pesquisa_id: '', tipo: 'texto', titulo: '', opcoes: '' })

  useEffect(() => { load() }, [])
  useEffect(() => { loadPerguntas() }, [pesquisaId])

  async function load() {
    const res = await api.get('/pesquisas?limit=100')
    setPesquisas(res.data.pesquisas)
  }

  async function loadPerguntas() {
    const params = pesquisaId ? `?pesquisa_id=${pesquisaId}` : ''
    const res = await api.get(`/perguntas${params}`)
    setPerguntas(res.data.perguntas)
  }

  async function criar(e) {
    e.preventDefault()
    const body = { ...form }
    if (body.opcoes) body.opcoes = body.opcoes.split(',').map((s) => s.trim())
    else delete body.opcoes
    await api.post('/perguntas', body)
    setShowForm(false)
    setForm({ pesquisa_id: '', tipo: 'texto', titulo: '', opcoes: '' })
    loadPerguntas()
  }

  async function remover(id) {
    if (!confirm('Remover pergunta?')) return
    await api.delete(`/perguntas/${id}`)
    loadPerguntas()
  }

  return (
    <div>
      <div className="page-header">
        <h1>Biblioteca de Perguntas</h1>
        <button className="btn" onClick={() => setShowForm(!showForm)}>Nova Pergunta</button>
      </div>
      <select value={pesquisaId} onChange={(e) => setPesquisaId(e.target.value)}>
        <option value="">Todas as pesquisas</option>
        {pesquisas.map((p) => <option key={p.id} value={p.id}>{p.titulo}</option>)}
      </select>
      {showForm && (
        <form className="form" onSubmit={criar}>
          <select value={form.pesquisa_id} onChange={(e) => setForm({...form, pesquisa_id: e.target.value})} required>
            <option value="">Selecione a pesquisa</option>
            {pesquisas.map((p) => <option key={p.id} value={p.id}>{p.titulo}</option>)}
          </select>
          <select value={form.tipo} onChange={(e) => setForm({...form, tipo: e.target.value})}>
            {tipos.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <input placeholder="Título da pergunta" value={form.titulo} onChange={(e) => setForm({...form, titulo: e.target.value})} required />
          <input placeholder="Opções (separadas por vírgula)" value={form.opcoes} onChange={(e) => setForm({...form, opcoes: e.target.value})} />
          <button type="submit" className="btn btn-primary">Salvar</button>
        </form>
      )}
      <table>
        <thead><tr><th>Pergunta</th><th>Tipo</th><th>Opções</th><th>Ações</th></tr></thead>
        <tbody>
          {perguntas.map((p) => (
            <tr key={p.id}>
              <td>{p.titulo}</td>
              <td><span className="badge">{p.tipo}</span></td>
              <td>{p.opcoes ? p.opcoes.join(', ') : '-'}</td>
              <td><button className="btn btn-danger" onClick={() => remover(p.id)}>Remover</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
