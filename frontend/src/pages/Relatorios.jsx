import { useState, useEffect } from 'react'
import { Pie, Bar } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
import 'leaflet/dist/leaflet.css'
import api from '../services/api'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement)

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({ iconUrl: markerIcon, iconRetinaUrl: markerIcon2x, shadowUrl: markerShadow })

export default function Relatorios() {
  const [pesquisas, setPesquisas] = useState([])
  const [pesquisaId, setPesquisaId] = useState('')
  const [estatisticas, setEstatisticas] = useState(null)
  const [aba, setAba] = useState('graficos')

  useEffect(() => {
    api.get('/pesquisas?limit=100').then((res) => setPesquisas(res.data.pesquisas))
  }, [])

  async function carregar() {
    const res = await api.get(`/respostas/estatisticas/${pesquisaId}`)
    setEstatisticas(res.data)
  }

  const perguntasComGrafico = estatisticas?.perguntas?.filter((p) => p.contagem) || []
  const perguntasNumericas = estatisticas?.perguntas?.filter((p) => p.estatisticas) || []

  async function exportar(formato) {
    if (!pesquisaId) return
    const url = api.defaults.baseURL + `/exportacao/${formato}/${pesquisaId}`
    const token = localStorage.getItem('token')
    const a = document.createElement('a')
    a.href = url
    a.setAttribute('download', '')
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
    const blob = await res.blob()
    a.href = URL.createObjectURL(blob)
    a.click()
  }

  const dadosMapa = []
  if (estatisticas?.perguntas) {
    for (const p of estatisticas.perguntas) {
      if (p.tipo === 'unica_escolha' && p.contagem) {
        for (const c of p.contagem) {
          dadosMapa.push({ pergunta: p.titulo, valor: c.valor, quantidade: c.quantidade })
        }
      }
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1>Relatórios</h1>
        {pesquisaId && (
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn" onClick={() => exportar('pdf')}>PDF</button>
            <button className="btn" onClick={() => exportar('excel')}>Excel</button>
            <button className="btn" onClick={() => exportar('csv')}>CSV</button>
            <button className="btn" onClick={() => exportar('json')}>JSON</button>
          </div>
        )}
      </div>
      <div className="form-row" style={{ marginBottom: 20 }}>
        <select value={pesquisaId} onChange={(e) => setPesquisaId(e.target.value)}>
          <option value="">Selecione a pesquisa</option>
          {pesquisas.map((p) => <option key={p.id} value={p.id}>{p.titulo}</option>)}
        </select>
        <button className="btn btn-primary" disabled={!pesquisaId} onClick={carregar}>Carregar</button>
      </div>

      {estatisticas && (
        <>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <button className={`btn ${aba === 'graficos' ? 'btn-primary' : ''}`} onClick={() => setAba('graficos')}>Gráficos</button>
            <button className={`btn ${aba === 'mapa' ? 'btn-primary' : ''}`} onClick={() => setAba('mapa')}>Mapa</button>
            <button className={`btn ${aba === 'tabela' ? 'btn-primary' : ''}`} onClick={() => setAba('tabela')}>Tabela</button>
          </div>

          <p>Total de entrevistados: <strong>{estatisticas.total_entrevistados}</strong></p>

          {aba === 'graficos' && (
            <>
              {perguntasComGrafico.map((p) => {
                const colors = ['#2563eb', '#dc2626', '#16a34a', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316']
                const chartData = {
                  labels: p.contagem.map((c) => c.valor),
                  datasets: [{ data: p.contagem.map((c) => Number(c.quantidade)), backgroundColor: colors.slice(0, p.contagem.length) }],
                }
                return (
                  <div key={p.pergunta_id} className="chart-container">
                    <h3>{p.titulo}</h3>
                    <p>Total: {p.total} respostas</p>
                    <div style={{ maxWidth: 400, margin: '0 auto' }}>
                      <Pie data={chartData} />
                    </div>
                  </div>
                )
              })}
              {perguntasNumericas.map((p) => (
                <div key={p.pergunta_id} className="chart-container">
                  <h3>{p.titulo}</h3>
                  <p>Média: {Number(p.estatisticas.media).toFixed(2)} | Mín: {p.estatisticas.minimo} | Máx: {p.estatisticas.maximo}</p>
                </div>
              ))}
            </>
          )}

          {aba === 'mapa' && (
            <div className="chart-container">
              <h3>Distribuição Geográfica</h3>
              <p>Em breve: mapa com distribuição dos entrevistados por localidade.</p>
              <div style={{ height: 400, background: '#f1f5f9', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                Mapa interativo (requer dados de cidade/estado dos entrevistados)
              </div>
            </div>
          )}

          {aba === 'tabela' && (
            perguntasComGrafico.map((p) => (
              <div key={p.pergunta_id} className="chart-container">
                <h3>{p.titulo}</h3>
                <table>
                  <thead><tr><th>Opção</th><th>Quantidade</th><th>%</th></tr></thead>
                  <tbody>
                    {p.contagem.map((c) => (
                      <tr key={c.valor}>
                        <td>{c.valor}</td>
                        <td>{c.quantidade}</td>
                        <td>{((Number(c.quantidade) / p.total) * 100).toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))
          )}
        </>
      )}
    </div>
  )
}
