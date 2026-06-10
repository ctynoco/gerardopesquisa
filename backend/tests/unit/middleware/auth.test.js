const jwt = require('jsonwebtoken')
const { authenticate, authorize } = require('../../../src/middleware/auth')

jest.mock('../../../src/config/database', () => ({
  query: jest.fn(),
}))

const db = require('../../../src/config/database')

function mockReq(headers = {}, usuario = null) {
  return {
    headers: { authorization: headers.authorization },
    usuario,
  }
}

function mockRes() {
  const res = {}
  res.status = jest.fn().mockReturnValue(res)
  res.json = jest.fn().mockReturnValue(res)
  return res
}

describe('authenticate', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('deve retornar 401 se token não for fornecido', async () => {
    const req = mockReq({})
    const res = mockRes()
    const next = jest.fn()

    await authenticate(req, res, next)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith({ error: 'Token não fornecido' })
    expect(next).not.toHaveBeenCalled()
  })

  it('deve retornar 401 se token não começar com Bearer', async () => {
    const req = mockReq({ authorization: 'Invalid token' })
    const res = mockRes()
    const next = jest.fn()

    await authenticate(req, res, next)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(next).not.toHaveBeenCalled()
  })

  it('deve retornar 401 se token for inválido', async () => {
    const req = mockReq({ authorization: 'Bearer invalid_token' })
    const res = mockRes()
    const next = jest.fn()

    await authenticate(req, res, next)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith({ error: 'Token inválido ou expirado' })
    expect(next).not.toHaveBeenCalled()
  })

  it('deve retornar 401 se usuário não for encontrado', async () => {
    const token = jwt.sign({ id: 999 }, process.env.JWT_SECRET)
    const req = mockReq({ authorization: `Bearer ${token}` })
    const res = mockRes()
    const next = jest.fn()

    db.query.mockResolvedValueOnce({ rows: [] })

    await authenticate(req, res, next)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith({ error: 'Usuário não encontrado ou inativo' })
  })

  it('deve retornar 401 se usuário estiver inativo', async () => {
    const token = jwt.sign({ id: 1 }, process.env.JWT_SECRET)
    const req = mockReq({ authorization: `Bearer ${token}` })
    const res = mockRes()
    const next = jest.fn()

    db.query.mockResolvedValueOnce({ rows: [{ id: 1, ativo: false }] })

    await authenticate(req, res, next)

    expect(res.status).toHaveBeenCalledWith(401)
  })

  it('deve chamar next() se token e usuário forem válidos', async () => {
    const token = jwt.sign({ id: 1 }, process.env.JWT_SECRET)
    const req = mockReq({ authorization: `Bearer ${token}` })
    const res = mockRes()
    const next = jest.fn()

    const usuario = { id: 1, nome: 'Teste', email: 'teste@teste.com', perfil: 'admin', ativo: true }
    db.query.mockResolvedValueOnce({ rows: [usuario] })

    await authenticate(req, res, next)

    expect(next).toHaveBeenCalled()
    expect(req.usuario).toEqual(usuario)
  })
})

describe('authorize', () => {
  it('deve retornar 403 se perfil não for autorizado', () => {
    const req = { usuario: { perfil: 'entrevistador' } }
    const res = mockRes()
    const next = jest.fn()

    const middleware = authorize('admin')
    middleware(req, res, next)

    expect(res.status).toHaveBeenCalledWith(403)
    expect(res.json).toHaveBeenCalledWith({ error: 'Acesso não autorizado' })
    expect(next).not.toHaveBeenCalled()
  })

  it('deve retornar 403 se não houver usuario', () => {
    const req = {}
    const res = mockRes()
    const next = jest.fn()

    const middleware = authorize('admin')
    middleware(req, res, next)

    expect(res.status).toHaveBeenCalledWith(403)
  })

  it('deve chamar next() se perfil for autorizado', () => {
    const req = { usuario: { perfil: 'admin' } }
    const res = mockRes()
    const next = jest.fn()

    const middleware = authorize('admin')
    middleware(req, res, next)

    expect(next).toHaveBeenCalled()
  })

  it('deve aceitar múltiplos perfis', () => {
    const req = { usuario: { perfil: 'entrevistador' } }
    const res = mockRes()
    const next = jest.fn()

    const middleware = authorize('admin', 'entrevistador')
    middleware(req, res, next)

    expect(next).toHaveBeenCalled()
  })
})
