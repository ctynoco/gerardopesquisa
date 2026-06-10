const { listar, obter, criar, atualizar, remover, reordenar } = require('../../../src/controllers/perguntasController')

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

describe('perguntasController', () => {
  beforeEach(() => { jest.clearAllMocks() })

  describe('listar', () => {
    it('deve listar todas as perguntas', async () => {
      const req = mockReq({})
      const res = mockRes()
      const next = jest.fn()

      db.query.mockResolvedValueOnce({ rows: [{ id: 1, titulo: 'Pergunta 1', tipo: 'texto' }] })

      await listar(req, res, next)

      expect(res.json).toHaveBeenCalledWith({ perguntas: expect.any(Array) })
    })

    it('deve filtrar por pesquisa_id', async () => {
      const req = mockReq({ pesquisa_id: '1' })
      const res = mockRes()
      const next = jest.fn()

      db.query.mockResolvedValueOnce({ rows: [] })

      await listar(req, res, next)

      expect(db.query.mock.calls[0][1]).toEqual(['1'])
    })
  })

  describe('obter', () => {
    it('deve retornar pergunta por ID', async () => {
      const req = mockReq({}, { id: '1' })
      const res = mockRes()
      const next = jest.fn()

      db.query.mockResolvedValueOnce({ rows: [{ id: 1, titulo: 'Pergunta 1' }] })

      await obter(req, res, next)

      expect(res.json).toHaveBeenCalledWith({ pergunta: expect.objectContaining({ id: 1 }) })
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
    it('deve criar pergunta com sucesso', async () => {
      const req = mockReq({}, {}, { pesquisa_id: 1, tipo: 'texto', titulo: 'Qual seu nome?' })
      const res = mockRes()
      const next = jest.fn()

      db.query.mockResolvedValueOnce({ rows: [{ id: 1, pesquisa_id: 1, tipo: 'texto', titulo: 'Qual seu nome?' }] })

      await criar(req, res, next)

      expect(res.status).toHaveBeenCalledWith(201)
    })

    it('deve retornar 400 se campos obrigatórios faltarem', async () => {
      const req = mockReq({}, {}, { titulo: 'Só título' })
      const res = mockRes()
      const next = jest.fn()

      await criar(req, res, next)

      expect(res.status).toHaveBeenCalledWith(400)
    })

    it('deve retornar 400 se tipo for inválido', async () => {
      const req = mockReq({}, {}, { pesquisa_id: 1, tipo: 'invalido', titulo: 'Teste' })
      const res = mockRes()
      const next = jest.fn()

      await criar(req, res, next)

      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        error: expect.stringContaining('Tipo inválido'),
      }))
    })

    it('deve aceitar tipos válidos', async () => {
      const tiposValidos = ['texto', 'multipla_escolha', 'unica_escolha', 'numerica', 'data', 'likert', 'aberta']

      for (const tipo of tiposValidos) {
        const req = mockReq({}, {}, { pesquisa_id: 1, tipo, titulo: `Pergunta ${tipo}` })
        const res = mockRes()
        const next = jest.fn()

        db.query.mockResolvedValueOnce({ rows: [{ id: 1, tipo }] })

        await criar(req, res, next)
        expect(res.status).toHaveBeenCalledWith(201)
      }
    })
  })

  describe('reordenar', () => {
    it('deve reordenar perguntas com sucesso', async () => {
      const req = mockReq({}, {}, { ordem: [{ id: 1, ordenacao: 2 }, { id: 2, ordenacao: 1 }] })
      const res = mockRes()
      const next = jest.fn()

      db.query.mockResolvedValue({ rows: [] })

      await reordenar(req, res, next)

      expect(db.query).toHaveBeenCalledTimes(2)
      expect(res.json).toHaveBeenCalledWith({ message: 'Ordem atualizada' })
    })

    it('deve retornar 400 se ordem não for array', async () => {
      const req = mockReq({}, {}, { ordem: 'invalido' })
      const res = mockRes()
      const next = jest.fn()

      await reordenar(req, res, next)

      expect(res.status).toHaveBeenCalledWith(400)
    })
  })
})
