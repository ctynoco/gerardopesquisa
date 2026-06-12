import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('usuario')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export function addOfflineItem(url, body) {
  try {
    const fila = JSON.parse(localStorage.getItem('fila_offline') || '[]')
    fila.push({ url, body, criado: new Date().toISOString(), tentativas: 0 })
    localStorage.setItem('fila_offline', JSON.stringify(fila))
  } catch (e) { console.error('Erro ao adicionar à fila offline', e) }
}

export function getOfflineCount() {
  try {
    const fila = JSON.parse(localStorage.getItem('fila_offline') || '[]')
    return fila.length
  } catch { return 0 }
}

const MAX_RETRIES = 5
const BASE_DELAY = 2000

async function processItem(item, index, items) {
  try {
    await api.post(item.url, item.body)
    items.splice(index, 1)
    return true
  } catch (e) {
    item.tentativas = (item.tentativas || 0) + 1
    if (e.response?.status === 401 || e.response?.status === 404) {
      items.splice(index, 1)
      console.error('Removido da fila (falha permanente):', item.url, e.message)
      return true
    }
    if (item.tentativas >= MAX_RETRIES) {
      items.splice(index, 1)
      console.error('Removido da fila (max tentativas):', item.url)
      return true
    }
    return false
  }
}

async function sincronizarFila() {
  try {
    const fila = JSON.parse(localStorage.getItem('fila_offline') || '[]')
    if (!fila.length) return
    const pendentes = []
    for (let i = 0; i < fila.length; i++) {
      const ok = await processItem(fila[i], i, fila)
      if (!ok) pendentes.push(fila[i])
    }
    localStorage.setItem('fila_offline', JSON.stringify(pendentes))
    if (pendentes.length > 0) {
      setTimeout(sincronizarFila, BASE_DELAY)
    }
  } catch (e) { console.error('Erro ao sincronizar fila offline', e) }
}

window.addEventListener('online', () => { sincronizarFila() })

sincronizarFila()

export default api