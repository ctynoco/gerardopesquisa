const { listar, obter, criar, atualizar, remover } = require('../../../src/controllers/entrevistadosController')

jest.mock('../../../src/config/database', () => ({
  query: jest.fn(),
}))

const db = require('../../../src/config/database')

function mockReq(query = {}, params = {}, body = {}) {
  return { query, params, body }
}

function mockRes() {
  const res = {}
  res.status = jest.fn().mockReturnValue(res)
  res.json = jest.fn().mockReturnValue(res)
  return res
}

describe('entrevistadosController', () => {
  beforeEach(() => { jest.clearAllMocks() })

  describe('listar', () => {
    it('deve listar entrevistados com paginação padrão', async () => {
      const req = mockReq({})
      const res = mockRes()
      const next = jest.fn()

      db.query.mockResolvedValueOnce({ rows: [{ id: 1, nome: 'Maria', pesquisa_titulo: 'Pesquisa 1' }] })
      db.query.mockResolvedValueOnce({ rows: [{ count: '5' }] })

      await listar(req, res, next)

      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        entrevistados: expect.any(Array),
        total: 5,
        page: 1,
      }))
    })

    it('deve filtrar por pesquisa_id', async () => {
      const req = mockReq({ pesquisa_id: '1' })
      const res = mockRes()
      const next = jest.fn()

      db.query.mockResolvedValueOnce({ rows: [] })
      db.query.mockResolvedValueOnce({ rows: [{ count: '0' }] })

      await listar(req, res, next)

      expect(db.query.mock.calls[0][1][0]).toBe('1')
    })
  })

  describe('criar', () => {
    it('deve criar entrevistado com token de anonimização', async () => {
      const req = mockReq({}, {}, { pesquisa_id: 1, nome: 'Maria', cidade: 'São Paulo', estado: 'SP' })
      const res = mockRes()
      const next = jest.fn()

      const mockReturn = { rows: [{ id: 1, pesquisa_id: 1, nome: 'Maria', token_anonimizacao: 'abc123' }] }
      db.query.mockResolvedValueOnce(mockReturn)

      await criar(req, res, next)

      expect(res.status).toHaveBeenCalledWith(201)
      expect(res.json).toHaveBeenCalledWith({
        entrevistado: expect.objectContaining({
          token_anonimizacao: expect.any(String),
        }),
      })
    })

    it('deve retornar 400 se pesquisa_id faltar', async () => {
      const req = mockReq({}, {}, { nome: 'Maria' })
      const res = mockRes()
      const next = jest.fn()

      await criar(req, res, next)

      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith({ error: 'pesquisa_id é obrigatório' })
    })
  })

  describe('obter', () => {
    it('deve retornar entrevistado por ID', async () => {
      const req = mockReq({}, { id: '1' })
      const res = mockRes()
      const next = jest.fn()

      db.query.mockResolvedValueOnce({ rows: [{ id: 1, nome: 'Maria', pesquisa_titulo: 'Pesquisa 1' }] })

      await obter(req, res, next)

      expect(res.json).toHaveBeenCalledWith({ entrevistado: expect.objectContaining({ id: 1 }) })
    })

    it('deve retornar 404 se não encontrado', async () => {
      const req = mockReq({}, { id: '999' })
      const res = mockRes()
      const next = jest.fn()

      db.query.mockResolvedValueOnce({ rows: [] })

      await obter(req, res, next)

      expect(res.status).toHaveBeenCalledWith(404)
    })
  })

  describe('atualizar', () => {
    it('deve atualizar entrevistado com sucesso', async () => {
      const req = mockReq({}, { id: '1' }, { nome: 'Maria Updated' })
      const res = mockRes()
      const next = jest.fn()

      db.query.mockResolvedValueOnce({ rows: [{ id: 1, nome: 'Maria Updated' }] })

      await atualizar(req, res, next)

      expect(res.json).toHaveBeenCalledWith({ entrevistado: expect.objectContaining({ nome: 'Maria Updated' }) })
    })
  })

  describe('remover', () => {
    it('deve remover entrevistado com sucesso', async () => {
      const req = mockReq({}, { id: '1' })
      const res = mockRes()
      const next = jest.fn()

      db.query.mockResolvedValueOnce({ rows: [{ id: 1 }] })

      await remover(req, res, next)

      expect(res.json).toHaveBeenCalledWith({ message: 'Entrevistado removido' })
    })
  })
})
