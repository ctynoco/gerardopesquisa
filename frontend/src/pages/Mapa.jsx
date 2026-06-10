import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
import 'leaflet/dist/leaflet.css'
import api from '../services/api'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({ iconUrl: markerIcon, iconRetinaUrl: markerIcon2x, shadowUrl: markerShadow })

const coordsCidades = {
  'São Paulo': [-23.5505, -46.6333], 'Rio de Janeiro': [-22.9068, -43.1729],
  'Belo Horizonte': [-19.9167, -43.9345], 'Salvador': [-12.9714, -38.5014],
  'Fortaleza': [-3.7172, -38.5433], 'Recife': [-8.0476, -34.8770],
  'Porto Alegre': [-30.0346, -51.2177], 'Curitiba': [-25.4290, -49.2671],
  'Brasília': [-15.7975, -47.8919], 'Manaus': [-3.1190, -60.0217],
  'Belém': [-1.4558, -48.4902], 'Goiânia': [-16.6864, -49.2643],
  'São Luís': [-2.5297, -44.3028], 'Maceió': [-9.6662, -35.7352],
  'Natal': [-5.7945, -35.2110], 'João Pessoa': [-7.1153, -34.8610],
  'Teresina': [-5.0892, -42.8019], 'Aracaju': [-10.9472, -37.0731],
  'Campo Grande': [-20.4697, -54.6201], 'Cuiabá': [-15.5983, -56.0991],
  'Florianópolis': [-27.5945, -48.5577], 'Vitória': [-20.3155, -40.3128],
  'Palmas': [-10.1689, -48.3317], 'Porto Velho': [-8.7619, -63.9029],
  'Rio Branco': [-9.9740, -67.8076], 'Macapá': [-0.0230, -51.0500],
  'Boa Vista': [2.8196, -60.6733], 'Londrina': [-23.3103, -51.1628],
  'Uberlândia': [-18.9186, -48.2769], 'Campinas': [-22.9099, -47.0646],
}

export default function Mapa() {
  const [pesquisas, setPesquisas] = useState([])
  const [pesquisaId, setPesquisaId] = useState('')
  const [distribuicao, setDistribuicao] = useState(null)

  useEffect(() => {
    api.get('/pesquisas?limit=100').then((res) => setPesquisas(res.data.pesquisas))
  }, [])

  async function carregar() {
    const res = await api.get(`/geografico/distribuicao/${pesquisaId}`)
    setDistribuicao(res.data)
  }

  const markers = []
  if (distribuicao?.cidades) {
    for (const c of distribuicao.cidades) {
      const coord = coordsCidades[c.cidade]
      if (coord) markers.push({ cidade: c.cidade, estado: c.estado, qtd: c.quantidade, lat: coord[0], lng: coord[1] })
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1>Mapa Geográfico</h1>
      </div>
      <div className="form-row" style={{ marginBottom: 20 }}>
        <select value={pesquisaId} onChange={(e) => setPesquisaId(e.target.value)}>
          <option value="">Selecione a pesquisa</option>
          {pesquisas.map((p) => <option key={p.id} value={p.id}>{p.titulo}</option>)}
        </select>
        <button className="btn btn-primary" disabled={!pesquisaId} onClick={carregar}>Carregar Mapa</button>
      </div>
      {distribuicao && (
        <>
          <div style={{ height: 500, borderRadius: 8, overflow: 'hidden', marginBottom: 16 }}>
            <MapContainer center={[-14.2350, -51.9253]} zoom={4} style={{ height: '100%', width: '100%' }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              {markers.map((m) => (
                <Marker key={m.cidade} position={[m.lat, m.lng]}>
                  <Popup>
                    <strong>{m.cidade}</strong> - {m.estado}<br />
                    Entrevistados: {m.qtd}
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
          <div className="cards">
            {distribuicao.estados.map((e) => (
              <div key={e.estado} className="card" style={{ textAlign: 'center' }}>
                <h3>{e.quantidade}</h3>
                <p>{e.estado}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
