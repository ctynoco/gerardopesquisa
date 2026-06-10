const { listar, obter, criar, atualizar, remover } = require('../../../src/controllers/pesquisasController')

jest.mock('../../../src/config/database', () => ({
  query: jest.fn(),
}))

const db = require('../../../src/config/database')

function mockReq(query = {}, params = {}, body = {}, usuario = { id: 1 }) {
  return { query, params, body, usuario }
}

function mockRes() {
  const res = {}
  res.status = jest.fn().mockReturnValue(res)
  res.json = jest.fn().mockReturnValue(res)
  return res
}

describe('pesquisasController', () => {
  beforeEach(() => { jest.clearAllMocks() })

  describe('listar', () => {
    it('deve listar pesquisas com paginação padrão', async () => {
      const req = mockReq({})
      const res = mockRes()
      const next = jest.fn()

      db.query.mockResolvedValueOnce({ rows: [{ id: 1, titulo: 'Pesquisa 1', criador: 'Admin' }] })
      db.query.mockResolvedValueOnce({ rows: [{ count: '10' }] })

      await listar(req, res, next)

      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        pesquisas: expect.any(Array),
        total: 10,
        page: 1,
      }))
    })

    it('deve filtrar por status', async () => {
      const req = mockReq({ status: 'ativa' })
      const res = mockRes()
      const next = jest.fn()

      db.query.mockResolvedValueOnce({ rows: [] })
      db.query.mockResolvedValueOnce({ rows: [{ count: '0' }] })

      await listar(req, res, next)

      expect(db.query.mock.calls[0][1]).toContain('ativa')
    })
  })

  describe('obter', () => {
    it('deve retornar pesquisa por ID', async () => {
      const req = mockReq({}, { id: '1' })
      const res = mockRes()
      const next = jest.fn()

      db.query.mockResolvedValueOnce({ rows: [{ id: 1, titulo: 'Pesquisa 1', criador: 'Admin' }] })

      await obter(req, res, next)

      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        pesquisa: expect.objectContaining({ id: 1 }),
      }))
    })

    it('deve retornar 404 se não encontrada', async () => {
      const req = mockReq({}, { id: '999' })
      const res = mockRes()
      const next = jest.fn()

      db.query.mockResolvedValueOnce({ rows: [] })

      await obter(req, res, next)

      expect(res.status).toHaveBeenCalledWith(404)
    })
  })

  describe('criar', () => {
    it('deve criar pesquisa com sucesso', async () => {
      const req = mockReq({}, {}, { titulo: 'Nova Pesquisa', descricao: 'Descrição' }, { id: 1 })
      const res = mockRes()
      const next = jest.fn()

      db.query.mockResolvedValueOnce({ rows: [{ id: 1, titulo: 'Nova Pesquisa' }] })

      await criar(req, res, next)

      expect(res.status).toHaveBeenCalledWith(201)
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        pesquisa: expect.objectContaining({ titulo: 'Nova Pesquisa' }),
      }))
    })

    it('deve retornar 400 se título estiver faltando', async () => {
      const req = mockReq({}, {}, { descricao: 'Sem título' })
      const res = mockRes()
      const next = jest.fn()

      await criar(req, res, next)

      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith({ error: 'Título é obrigatório' })
    })
  })

  describe('atualizar', () => {
    it('deve atualizar pesquisa com sucesso', async () => {
      const req = mockReq({}, { id: '1' }, { titulo: 'Atualizado', descricao: 'Nova desc', status: 'ativa' })
      const res = mockRes()
      const next = jest.fn()

      db.query.mockResolvedValueOnce({ rows: [{ id: 1, titulo: 'Atualizado' }] })

      await atualizar(req, res, next)

      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        pesquisa: expect.objectContaining({ titulo: 'Atualizado' }),
      }))
    })

    it('deve retornar 404 se pesquisa não existir', async () => {
      const req = mockReq({}, { id: '999' }, { titulo: 'Teste' })
      const res = mockRes()
      const next = jest.fn()

      db.query.mockResolvedValueOnce({ rows: [] })

      await atualizar(req, res, next)

      expect(res.status).toHaveBeenCalledWith(404)
    })
  })

  describe('remover', () => {
    it('deve remover pesquisa com sucesso', async () => {
      const req = mockReq({}, { id: '1' })
      const res = mockRes()
      const next = jest.fn()

      db.query.mockResolvedValueOnce({ rows: [{ id: 1 }] })

      await remover(req, res, next)

      expect(res.json).toHaveBeenCalledWith({ message: 'Pesquisa removida' })
    })

    it('deve retornar 404 se pesquisa não existir', async () => {
      const req = mockReq({}, { id: '999' })
      const res = mockRes()
      const next = jest.fn()

      db.query.mockResolvedValueOnce({ rows: [] })

      await remover(req, res, next)

      expect(res.status).toHaveBeenCalledWith(404)
    })
  })
})
