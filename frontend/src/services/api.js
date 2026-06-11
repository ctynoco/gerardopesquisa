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

async function sincronizarFila() {
  try {
    const fila = JSON.parse(localStorage.getItem('fila_offline') || '[]')
    if (!fila.length) return
    const pendentes = []
    for (const item of fila) {
      try {
        await api.post(item.url, item.body)
      } catch { pendentes.push(item) }
    }
    localStorage.setItem('fila_offline', JSON.stringify(pendentes))
  } catch {}
}

window.addEventListener('online', () => { sincronizarFila() })

sincronizarFila()

export default api
