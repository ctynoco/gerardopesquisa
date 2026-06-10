import { useState, useEffect } from 'react'
import { Bar } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement } from 'chart.js'
import api from '../services/api'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement)

export default function Dashboard() {
  const [resumo, setResumo] = useState({ pesquisas: 0, entrevistados: 0, perguntas: 0 })
  const [ultimasPesquisas, setUltimasPesquisas] = useState([])
  const [maisRespondidas, setMaisRespondidas] = useState([])

  useEffect(() => {
    async function load() {
      try {
        const [pesquisasRes, entrevistadosRes, perguntasRes] = await Promise.all([
          api.get('/pesquisas?limit=5'),
          api.get('/entrevistados?limit=1000'),
          api.get('/perguntas'),
        ])
        setUltimasPesquisas(pesquisasRes.data.pesquisas)
        setResumo({
          pesquisas: pesquisasRes.data.total,
          entrevistados: entrevistadosRes.data.total,
          perguntas: perguntasRes.data.perguntas.length,
        })
      } catch {}
    }
    load()
  }, [])

  const chartData = {
    labels: ultimasPesquisas.map((p) => p.titulo?.slice(0, 20)),
    datasets: [{
      label: 'Entrevistados',
      data: ultimasPesquisas.map((p) => Number(p.total_entrevistados) || 0),
      backgroundColor: '#2563eb',
    }],
  }

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      <div className="cards">
        <div className="card"><h3>{resumo.pesquisas}</h3><p>Pesquisas</p></div>
        <div className="card"><h3>{resumo.perguntas}</h3><p>Perguntas</p></div>
        <div className="card"><h3>{resumo.entrevistados}</h3><p>Entrevistados</p></div>
      </div>
      <div className="chart-container">
        <h2>Entrevistados por Pesquisa</h2>
        <Bar data={chartData} />
      </div>
    </div>
  )
}
