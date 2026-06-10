const { listar, criar, estatisticas } = require('../../../src/controllers/respostasController')

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

describe('respostasController', () => {
  beforeEach(() => { jest.clearAllMocks() })

  describe('listar', () => {
    it('deve listar respostas sem filtros', async () => {
      const req = mockReq({})
      const res = mockRes()
      const next = jest.fn()

      db.query.mockResolvedValueOnce({ rows: [] })

      await listar(req, res, next)

      expect(res.json).toHaveBeenCalledWith({ respostas: [] })
    })

    it('deve filtrar por pesquisa_id', async () => {
      const req = mockReq({ pesquisa_id: '1' })
      const res = mockRes()
      const next = jest.fn()

      db.query.mockResolvedValueOnce({ rows: [] })

      await listar(req, res, next)

      expect(db.query.mock.calls[0][1]).toEqual(['1'])
    })

    it('deve filtrar por pesquisa_id e entrevistado_id', async () => {
      const req = mockReq({ pesquisa_id: '1', entrevistado_id: '2' })
      const res = mockRes()
      const next = jest.fn()

      db.query.mockResolvedValueOnce({ rows: [] })

      await listar(req, res, next)

      expect(db.query.mock.calls[0][1]).toEqual(['1', '2'])
    })
  })

  describe('criar', () => {
    it('deve criar resposta com upsert', async () => {
      const req = mockReq({}, {}, {
        pesquisa_id: 1,
        pergunta_id: 1,
        entrevistado_id: 1,
        resposta: { valor: 'Sim' },
      })
      const res = mockRes()
      const next = jest.fn()

      db.query.mockResolvedValueOnce({ rows: [{ id: 1, resposta: { valor: 'Sim' } }] })

      await criar(req, res, next)

      expect(res.status).toHaveBeenCalledWith(201)
      expect(res.json).toHaveBeenCalledWith({ resposta: expect.objectContaining({ resposta: { valor: 'Sim' } }) })
    })

    it('deve retornar 400 se campos obrigatórios faltarem', async () => {
      const testCases = [
        { pesquisa_id: 1, pergunta_id: 1, entrevistado_id: 1 },
        { pesquisa_id: 1, pergunta_id: 1, resposta: { valor: 'x' } },
        { pesquisa_id: 1, entrevistado_id: 1, resposta: { valor: 'x' } },
        { pergunta_id: 1, entrevistado_id: 1, resposta: { valor: 'x' } },
      ]

      for (const body of testCases) {
        const req = mockReq({}, {}, body)
        const res = mockRes()
        const next = jest.fn()

        await criar(req, res, next)
        expect(res.status).toHaveBeenCalledWith(400)
      }
    })
  })

  describe('estatisticas', () => {
    it('deve calcular estatísticas para pesquisa', async () => {
      const req = mockReq({}, { pesquisa_id: '1' })
      const res = mockRes()
      const next = jest.fn()

      db.query
        .mockResolvedValueOnce({
          rows: [
            { id: 1, titulo: 'Qual sua cor favorita?', tipo: 'unica_escolha', opcoes: ['Azul', 'Vermelho'] },
            { id: 2, titulo: 'Sua idade', tipo: 'numerica', opcoes: null },
          ],
        })
        .mockResolvedValueOnce({ rows: [{ id: 1, resposta: { valor: 'Azul' } }] })
        .mockResolvedValueOnce({ rows: [{ valor: 'Azul', quantidade: 3 }, { valor: 'Vermelho', quantidade: 2 }] })
        .mockResolvedValueOnce({ rows: [{ id: 2, resposta: { valor: '25' } }] })
        .mockResolvedValueOnce({ rows: [{ media: '25.5', minimo: '18', maximo: '35' }] })
        .mockResolvedValueOnce({ rows: [{ count: '5' }] })

      await estatisticas(req, res, next)

      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        pesquisa_id: 1,
        total_entrevistados: 5,
        perguntas: expect.arrayContaining([
          expect.objectContaining({ pergunta_id: 1, tipo: 'unica_escolha' }),
          expect.objectContaining({ pergunta_id: 2, tipo: 'numerica' }),
        ]),
      }))
    })
  })
})
