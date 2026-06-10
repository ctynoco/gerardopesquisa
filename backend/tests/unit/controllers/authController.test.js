const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { register, login, perfil } = require('../../../src/controllers/authController')

jest.mock('../../../src/config/database', () => ({
  query: jest.fn(),
}))

const db = require('../../../src/config/database')

function mockReq(body = {}, usuario = null) {
  return { body, usuario }
}

function mockRes() {
  const res = {}
  res.status = jest.fn().mockReturnValue(res)
  res.json = jest.fn().mockReturnValue(res)
  return res
}

describe('authController - register', () => {
  beforeEach(() => { jest.clearAllMocks() })

  it('deve registrar um novo usuário com sucesso', async () => {
    const req = mockReq({ nome: 'João', telefone: '(85) 996962828', senha: '123456' })
    const res = mockRes()
    const next = jest.fn()

    db.query.mockResolvedValueOnce({ rows: [] })
    db.query.mockResolvedValueOnce({ rows: [{ id: 1, nome: 'João', telefone: '(85) 996962828', perfil: 'entrevistador', created_at: new Date() }] })

    await register(req, res, next)

    expect(res.status).toHaveBeenCalledWith(201)
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      usuario: expect.objectContaining({ nome: 'João' }),
    }))
  })

  it('deve retornar 400 se campos obrigatórios faltarem', async () => {
    const req = mockReq({ nome: 'João' })
    const res = mockRes()
    const next = jest.fn()

    await register(req, res, next)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({ error: 'Nome, telefone e senha são obrigatórios' })
  })

  it('deve retornar 409 se telefone já existir', async () => {
    const req = mockReq({ nome: 'João', telefone: '(85) 996962828', senha: '123456' })
    const res = mockRes()
    const next = jest.fn()

    db.query.mockResolvedValueOnce({ rows: [{ id: 1 }] })

    await register(req, res, next)

    expect(res.status).toHaveBeenCalledWith(409)
    expect(res.json).toHaveBeenCalledWith({ error: 'Telefone já cadastrado' })
  })

  it('deve usar perfil padrão entrevistador se não fornecido', async () => {
    const req = mockReq({ nome: 'João', telefone: '(85) 123456789', senha: '123456' })
    const res = mockRes()
    const next = jest.fn()

    db.query.mockResolvedValueOnce({ rows: [] })
    db.query.mockResolvedValueOnce({ rows: [{ id: 2, nome: 'João', telefone: '(85) 123456789', perfil: 'entrevistador' }] })

    await register(req, res, next)

    expect(db.query.mock.calls[1][1][3]).toBe('entrevistador')
  })
})

describe('authController - login', () => {
  beforeEach(() => { jest.clearAllMocks() })

  it('deve fazer login com sucesso', async () => {
    const senhaHash = bcrypt.hashSync('123456', 10)
    const req = mockReq({ telefone: '(85) 996962828', senha: '123456' })
    const res = mockRes()
    const next = jest.fn()

    db.query.mockResolvedValueOnce({ rows: [{ id: 1, nome: 'João', telefone: '(85) 996962828', senha: senhaHash, perfil: 'entrevistador', ativo: true }] })

    await login(req, res, next)

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      token: expect.any(String),
      usuario: expect.objectContaining({ id: 1, nome: 'João' }),
    }))
  })

  it('deve retornar 400 se telefone/senha não forem fornecidos', async () => {
    const req = mockReq({ telefone: '(85) 996962828' })
    const res = mockRes()
    const next = jest.fn()

    await login(req, res, next)

    expect(res.status).toHaveBeenCalledWith(400)
  })

  it('deve retornar 401 se telefone não existir', async () => {
    const req = mockReq({ telefone: '(85) 000000000', senha: '123456' })
    const res = mockRes()
    const next = jest.fn()

    db.query.mockResolvedValueOnce({ rows: [] })

    await login(req, res, next)

    expect(res.status).toHaveBeenCalledWith(401)
  })

  it('deve retornar 401 se usuário estiver inativo', async () => {
    const req = mockReq({ telefone: '(85) 996962828', senha: '123456' })
    const res = mockRes()
    const next = jest.fn()

    db.query.mockResolvedValueOnce({ rows: [{ id: 1, nome: 'Inativo', telefone: '(85) 996962828', senha: 'hash', perfil: 'entrevistador', ativo: false }] })

    await login(req, res, next)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith({ error: 'Usuário inativo' })
  })

  it('deve retornar 401 se senha estiver errada', async () => {
    const senhaHash = bcrypt.hashSync('senha_correta', 10)
    const req = mockReq({ telefone: '(85) 996962828', senha: 'senha_errada' })
    const res = mockRes()
    const next = jest.fn()

    db.query.mockResolvedValueOnce({ rows: [{ id: 1, nome: 'João', telefone: '(85) 996962828', senha: senhaHash, perfil: 'entrevistador', ativo: true }] })

    await login(req, res, next)

    expect(res.status).toHaveBeenCalledWith(401)
  })
})

describe('authController - perfil', () => {
  beforeEach(() => { jest.clearAllMocks() })

  it('deve retornar dados do usuário autenticado', async () => {
    const req = mockReq({}, { id: 1 })
    const res = mockRes()
    const next = jest.fn()

    db.query.mockResolvedValueOnce({ rows: [{ id: 1, nome: 'João', telefone: '(85) 996962828', perfil: 'entrevistador', ativo: true, created_at: new Date() }] })

    await perfil(req, res, next)

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      usuario: expect.objectContaining({ id: 1 }),
    }))
  })

  it('deve retornar 404 se usuário não for encontrado', async () => {
    const req = mockReq({}, { id: 999 })
    const res = mockRes()
    const next = jest.fn()

    db.query.mockResolvedValueOnce({ rows: [] })

    await perfil(req, res, next)

    expect(res.status).toHaveBeenCalledWith(404)
  })
})
