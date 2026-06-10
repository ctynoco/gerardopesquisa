import { useState, useEffect } from 'react'
import api from '../services/api'

export default function Coleta() {
  const [pesquisas, setPesquisas] = useState([])
  const [pesquisaId, setPesquisaId] = useState('')
  const [perguntas, setPerguntas] = useState([])
  const [respostas, setRespostas] = useState({})
  const [ entrevistado, setEntrevistado] = useState({ nome: '', idade: '', cidade: '', estado: '' })
  const [etapa, setEtapa] = useState('pesquisa')

  useEffect(() => {
    api.get('/pesquisas?limit=100').then((res) => setPesquisas(res.data.pesquisas))
  }, [])

  async function iniciarColeta() {
    const res = await api.get(`/perguntas?pesquisa_id=${pesquisaId}`)
    setPerguntas(res.data.perguntas)
    setEtapa('entrevistado')
  }

  async function salvarEntrevistado() {
    const res = await api.post('/entrevistados', { ...entrevistado, pesquisa_id: Number(pesquisaId) })
    setEntrevistado({ ...res.data.entrevistado, ...entrevistado })
    setEtapa('perguntas')
  }

  async function responder(perguntaId, valor) {
    const eid = entrevistado.id || (await api.post('/entrevistados', { ...entrevistado, pesquisa_id: Number(pesquisaId) })).data.entrevistado.id
    if (!entrevistado.id) setEntrevistado((prev) => ({ ...prev, id: eid }))
    setRespostas((prev) => ({ ...prev, [perguntaId]: valor }))
    await api.post('/respostas', {
      pesquisa_id: Number(pesquisaId),
      pergunta_id: Number(perguntaId),
      entrevistado_id: Number(eid),
      resposta: { valor },
    })
  }

  async function finalizar() {
    alert('Coleta finalizada!')
    setEtapa('pesquisa')
    setPesquisaId('')
    setPerguntas([])
    setRespostas({})
    setEntrevistado({ nome: '', idade: '', cidade: '', estado: '' })
  }

  if (etapa === 'pesquisa') {
    return (
      <div className="coleta">
        <h1>Coleta de Dados</h1>
        <div className="form">
          <select value={pesquisaId} onChange={(e) => setPesquisaId(e.target.value)}>
            <option value="">Selecione a pesquisa</option>
            {pesquisas.map((p) => <option key={p.id} value={p.id}>{p.titulo}</option>)}
          </select>
          <button className="btn btn-primary" disabled={!pesquisaId} onClick={iniciarColeta}>Iniciar Coleta</button>
        </div>
      </div>
    )
  }

  if (etapa === 'entrevistado') {
    return (
      <div className="coleta">
        <h1>Dados do Entrevistado</h1>
        <div className="form">
          <input placeholder="Nome" value={entrevistado.nome} onChange={(e) => setEntrevistado({...entrevistado, nome: e.target.value})} />
          <input type="number" placeholder="Idade" value={entrevistado.idade} onChange={(e) => setEntrevistado({...entrevistado, idade: e.target.value})} />
          <input placeholder="Cidade" value={entrevistado.cidade} onChange={(e) => setEntrevistado({...entrevistado, cidade: e.target.value})} />
          <input placeholder="Estado" maxLength={2} value={entrevistado.estado} onChange={(e) => setEntrevistado({...entrevistado, estado: e.target.value})} />
          <button className="btn btn-primary" onClick={salvarEntrevistado}>Começar Perguntas</button>
        </div>
      </div>
    )
  }

  return (
    <div className="coleta">
      <h1>Questionário</h1>
      <p className="entrevistado-info">Entrevistado: {entrevistado.nome}</p>
      {perguntas.map((p) => (
        <div key={p.id} className="pergunta-card">
          <p>{p.titulo}</p>
          {p.tipo === 'unica_escolha' || p.tipo === 'multipla_escolha' ? (
            <div className="opcoes">
              {p.opcoes?.map((o) => (
                <button key={o} className={`btn ${respostas[p.id] === o ? 'btn-primary' : ''}`} onClick={() => responder(p.id, o)}>{o}</button>
              ))}
            </div>
          ) : (
            <input value={respostas[p.id] || ''} onChange={(e) => responder(p.id, e.target.value)} placeholder="Resposta..." />
          )}
        </div>
      ))}
      <button className="btn btn-primary" onClick={finalizar}>Finalizar Coleta</button>
    </div>
  )
}
