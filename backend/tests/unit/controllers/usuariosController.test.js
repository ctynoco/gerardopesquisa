const { listar, criar, atualizar, resetarSenha, remover } = require('../../../src/controllers/usuariosController')

jest.mock('../../../src/config/database', () => ({
  query: jest.fn(),
}))

const db = require('../../../src/config/database')

function mockReq(body = {}, params = {}, usuario = { id: 1, perfil: 'admin' }) {
  return { body, params, usuario }
}

function mockRes() {
  const res = {}
  res.status = jest.fn().mockReturnValue(res)
  res.json = jest.fn().mockReturnValue(res)
  return res
}

describe('usuariosController', () => {
  beforeEach(() => { jest.clearAllMocks() })

  describe('listar', () => {
    it('deve listar todos os usuários', async () => {
      const req = mockReq()
      const res = mockRes()
      const next = jest.fn()

      db.query.mockResolvedValueOnce({ rows: [{ id: 1, nome: 'Admin', email: 'admin@teste.com' }] })

      await listar(req, res, next)

      expect(res.json).toHaveBeenCalledWith({ usuarios: expect.any(Array) })
    })
  })

  describe('criar', () => {
    it('deve criar usuário com sucesso', async () => {
      const req = mockReq({ nome: 'Novo', email: 'novo@teste.com', senha: '123456' })
      const res = mockRes()
      const next = jest.fn()

      db.query.mockResolvedValueOnce({ rows: [] })
      db.query.mockResolvedValueOnce({ rows: [{ id: 2, nome: 'Novo', email: 'novo@teste.com' }] })

      await criar(req, res, next)

      expect(res.status).toHaveBeenCalledWith(201)
    })

    it('deve retornar 400 se faltar campos', async () => {
      const req = mockReq({ nome: 'Sem email' })
      const res = mockRes()
      const next = jest.fn()

      await criar(req, res, next)

      expect(res.status).toHaveBeenCalledWith(400)
    })

    it('deve retornar 409 se email já existir', async () => {
      const req = mockReq({ nome: 'Duplicado', email: 'existente@teste.com', senha: '123456' })
      const res = mockRes()
      const next = jest.fn()

      db.query.mockResolvedValueOnce({ rows: [{ id: 1 }] })

      await criar(req, res, next)

      expect(res.status).toHaveBeenCalledWith(409)
    })
  })

  describe('remover', () => {
    it('deve bloquear auto-remoção', async () => {
      const req = mockReq({}, { id: '1' }, { id: 1 })
      const res = mockRes()
      const next = jest.fn()

      await remover(req, res, next)

      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith({ error: 'Não é possível remover o próprio usuário' })
    })

    it('deve remover outro usuário', async () => {
      const req = mockReq({}, { id: '2' }, { id: 1 })
      const res = mockRes()
      const next = jest.fn()

      db.query.mockResolvedValueOnce({ rows: [{ id: 2 }] })

      await remover(req, res, next)

      expect(res.json).toHaveBeenCalledWith({ message: 'Usuário removido' })
    })
  })

  describe('resetarSenha', () => {
    it('deve resetar senha com sucesso', async () => {
      const req = mockReq({ senha: 'nova123' }, { id: '2' })
      const res = mockRes()
      const next = jest.fn()

      db.query.mockResolvedValueOnce({ rows: [{ id: 2 }] })

      await resetarSenha(req, res, next)

      expect(res.json).toHaveBeenCalledWith({ message: 'Senha redefinida' })
    })

    it('deve retornar 400 se senha não for fornecida', async () => {
      const req = mockReq({}, { id: '2' })
      const res = mockRes()
      const next = jest.fn()

      await resetarSenha(req, res, next)

      expect(res.status).toHaveBeenCalledWith(400)
    })
  })
})
