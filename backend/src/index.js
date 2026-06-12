require('dotenv').config()
const express = require('express')
const cors = require('cors')
const rateLimit = require('express-rate-limit')
const { auditLog } = require('./middleware/audit')
const errorHandler = require('./middleware/errorHandler')
const runMigrations = require('./config/run-migrations')
const authRoutes = require('./routes/authRoutes')
const pesquisasRoutes = require('./routes/pesquisasRoutes')
const perguntasRoutes = require('./routes/perguntasRoutes')
const entrevistadosRoutes = require('./routes/entrevistadosRoutes')
const respostasRoutes = require('./routes/respostasRoutes')
const cruzamentosRoutes = require('./routes/cruzamentosRoutes')
const exportacaoRoutes = require('./routes/exportacaoRoutes')
const usuariosRoutes = require('./routes/usuariosRoutes')
const auditoriaRoutes = require('./routes/auditoriaRoutes')
const geograficoRoutes = require('./routes/geograficoRoutes')
const cotasRoutes = require('./routes/cotasRoutes')
const supervisaoRoutes = require('./routes/supervisaoRoutes')
const apuracaoRoutes = require('./routes/apuracaoRoutes')

const app = express()
const PORT = process.env.PORT || 3000

const corsOrigins = [
  ...(process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map((s) => s.trim())
    : []),
  'http://localhost:5173',
  'http://localhost:4173',
  'https://gerardopesquisa.vercel.app',
  'https://pesquisa-eleitoral.vercel.app',
]

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { error: 'Muitas requisições. Tente novamente em 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
})

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Muitas tentativas de login. Tente novamente em 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
})

app.use(cors({
  origin: corsOrigins.length ? corsOrigins : '*',
  credentials: true,
}))
app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: true, limit: '1mb' }))
app.use('/api/', limiter)
app.use('/api/auth', authLimiter)
app.use(auditLog)

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.use('/api/auth', authRoutes)
app.use('/api/pesquisas', pesquisasRoutes)
app.use('/api/perguntas', perguntasRoutes)
app.use('/api/entrevistados', entrevistadosRoutes)
app.use('/api/respostas', respostasRoutes)
app.use('/api/exportacao', exportacaoRoutes)
app.use('/api/usuarios', usuariosRoutes)
app.use('/api/auditoria', auditoriaRoutes)
app.use('/api/geografico', geograficoRoutes)
app.use('/api', cruzamentosRoutes)
app.use('/api', cotasRoutes)
app.use('/api', supervisaoRoutes)
app.use('/api', apuracaoRoutes)

app.use(errorHandler)

async function start() {
  try {
    await runMigrations()
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
    })
  } catch (err) {
    console.error('Failed to start server:', err)
    process.exit(1)
  }
}

start()
