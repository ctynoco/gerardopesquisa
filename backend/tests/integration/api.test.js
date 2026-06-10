const request = require('supertest')
const express = require('express')
const cors = require('cors')

jest.mock('../../src/config/database', () => ({
  query: jest.fn(),
  pool: { on: jest.fn() },
}))

const db = require('../../src/config/database')

const { auditLog } = require('../../src/middleware/audit')
const errorHandler = require('../../src/middleware/errorHandler')
const authRoutes = require('../../src/routes/authRoutes')
const pesquisasRoutes = require('../../src/routes/pesquisasRoutes')
const perguntasRoutes = require('../../src/routes/perguntasRoutes')
const entrevistadosRoutes = require('../../src/routes/entrevistadosRoutes')
const respostasRoutes = require('../../src/routes/respostasRoutes')
const usuariosRoutes = require('../../src/routes/usuariosRoutes')
const auditoriaRoutes = require('../../src/routes/auditoriaRoutes')
const geograficoRoutes = require('../../src/routes/geograficoRoutes')

function createApp() {
  const app = express()
  app.use(cors())
  app.use(express.json())
  app.use(auditLog)

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() })
  })

  app.use('/api/auth', authRoutes)
  app.use('/api/pesquisas', pesquisasRoutes)
  app.use('/api/perguntas', perguntasRoutes)
  app.use('/api/entrevistados', entrevistadosRoutes)
  app.use('/api/respostas', respostasRoutes)
  app.use('/api/usuarios', usuariosRoutes)
  app.use('/api/auditoria', auditoriaRoutes)
  app.use('/api/geografico', geograficoRoutes)

  app.use(errorHandler)
  return app
}

describe('API Integration Tests', () => {
  let app

  beforeAll(() => {
    process.env.JWT_SECRET = 'test_secret_key'
    app = createApp()
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/health', () => {
    it('deve retornar status ok', async () => {
      const res = await request(app).get('/api/health')
      expect(res.status).toBe(200)
      expect(res.body.status).toBe('ok')
      expect(res.body.timestamp).toBeDefined()
    })
  })

  describe('POST /api/auth/register', () => {
    it('deve registrar usuário com sucesso', async () => {
      db.query.mockResolvedValueOnce({ rows: [] })
      db.query.mockResolvedValueOnce({ rows: [{ id: 1, nome: 'Teste', email: 'teste@teste.com', perfil: 'entrevistador', created_at: new Date() }] })

      const res = await request(app)
        .post('/api/auth/register')
        .send({ nome: 'Teste', email: 'teste@teste.com', senha: '123456' })

      expect(res.status).toBe(201)
      expect(res.body.usuario).toBeDefined()
    })

    it('deve retornar 400 para dados inválidos', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ nome: 'Teste' })

      expect(res.status).toBe(400)
    })
  })

  describe('POST /api/auth/login', () => {
    it('deve fazer login e retornar token', async () => {
      const bcrypt = require('bcryptjs')
      const senhaHash = bcrypt.hashSync('123456', 10)

      db.query.mockResolvedValueOnce({
        rows: [{ id: 1, nome: 'Teste', email: 'teste@teste.com', senha: senhaHash, perfil: 'entrevistador', ativo: true }],
      })

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'teste@teste.com', senha: '123456' })

      expect(res.status).toBe(200)
      expect(res.body.token).toBeDefined()
      expect(res.body.usuario).toBeDefined()
    })

    it('deve retornar 401 para credenciais inválidas', async () => {
      db.query.mockResolvedValueOnce({ rows: [] })

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'wrong@teste.com', senha: 'wrong' })

      expect(res.status).toBe(401)
    })
  })

  describe('Rotas protegidas - autenticação', () => {
    it('deve retornar 401 sem token', async () => {
      const rotas = [
        { method: 'get', path: '/api/pesquisas' },
        { method: 'post', path: '/api/pesquisas' },
        { method: 'get', path: '/api/perguntas' },
        { method: 'post', path: '/api/perguntas' },
        { method: 'get', path: '/api/entrevistados' },
        { method: 'post', path: '/api/entrevistados' },
        { method: 'get', path: '/api/respostas' },
        { method: 'post', path: '/api/respostas' },
        { method: 'get', path: '/api/usuarios' },
        { method: 'get', path: '/api/auditoria' },
      ]

      for (const rota of rotas) {
        const res = await request(app)[rota.method](rota.path)
        expect(res.status).toBe(401)
      }
    })
  })

  describe('Rotas admin - autorização', () => {
    it('deve retornar 403 para não-admin em rotas de usuários', async () => {
      const jwt = require('jsonwebtoken')
      const token = jwt.sign({ id: 2, perfil: 'entrevistador' }, process.env.JWT_SECRET)

      db.query.mockResolvedValue({ rows: [{ id: 2, nome: 'Entrevistador', email: 'ent@teste.com', perfil: 'entrevistador', ativo: true }] })

      const res = await request(app)
        .get('/api/usuarios')
        .set('Authorization', `Bearer ${token}`)

      expect(res.status).toBe(403)
    })
  })

  describe('CRUD Pesquisas', () => {
    it('deve criar e listar pesquisas', async () => {
      const jwt = require('jsonwebtoken')
      const token = jwt.sign({ id: 1, perfil: 'admin' }, process.env.JWT_SECRET)

      db.query.mockReset()
      db.query
        .mockResolvedValueOnce({ rows: [{ id: 1, nome: 'Admin', email: 'admin@teste.com', perfil: 'admin', ativo: true }] })
        .mockResolvedValueOnce({ rows: [{ id: 1, titulo: 'Pesquisa Teste' }] })

      const createRes = await request(app)
        .post('/api/pesquisas')
        .set('Authorization', `Bearer ${token}`)
        .send({ titulo: 'Pesquisa Teste' })

      expect(createRes.status).toBe(201)

      db.query.mockReset()
      db.query
        .mockResolvedValueOnce({ rows: [{ id: 1, nome: 'Admin', email: 'admin@teste.com', perfil: 'admin', ativo: true }] })
        .mockResolvedValueOnce({ rows: [{ id: 1, titulo: 'Pesquisa Teste', criador: 'Admin', total_entrevistados: 0 }] })
        .mockResolvedValueOnce({ rows: [{ count: '1' }] })

      const listRes = await request(app)
        .get('/api/pesquisas')
        .set('Authorization', `Bearer ${token}`)

      expect(listRes.status).toBe(200)
      expect(listRes.body.pesquisas).toBeDefined()
    })
  })
})
