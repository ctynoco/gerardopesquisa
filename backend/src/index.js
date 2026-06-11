require('dotenv').config()
const express = require('express')
const cors = require('cors')
const { auditLog } = require('./middleware/audit')
const errorHandler = require('./middleware/errorHandler')
const runMigrations = require('./config/run-migrations')
const authRoutes = require('./routes/authRoutes')
const demoRoutes = require('./routes/demoRoutes')
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
const seedRoutes = require('./routes/seedRoutes')

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

app.use(cors({
  origin: corsOrigins.length ? corsOrigins : '*',
  credentials: true,
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
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
app.use('/api', seedRoutes)
app.use('/api', demoRoutes)
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
