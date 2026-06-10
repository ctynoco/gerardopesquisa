const { listar } = require('../../../src/controllers/auditoriaController')

jest.mock('../../../src/config/database', () => ({
  query: jest.fn(),
}))

const db = require('../../../src/config/database')

function mockReq(query = {}) {
  return { query }
}

function mockRes() {
  const res = {}
  res.status = jest.fn().mockReturnValue(res)
  res.json = jest.fn().mockReturnValue(res)
  return res
}

describe('auditoriaController', () => {
  beforeEach(() => { jest.clearAllMocks() })

  it('deve listar logs de auditoria com paginação padrão', async () => {
    const req = mockReq({})
    const res = mockRes()
    const next = jest.fn()

    db.query.mockResolvedValueOnce({ rows: [{ id: 1, acao: 'POST /api/pesquisas', usuario_nome: 'Admin' }] })
    db.query.mockResolvedValueOnce({ rows: [{ count: '1' }] })

    await listar(req, res, next)

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      auditoria: expect.any(Array),
      total: 1,
    }))
  })

  it('deve respeitar paginação personalizada', async () => {
    const req = mockReq({ page: '2', limit: '10' })
    const res = mockRes()
    const next = jest.fn()

    db.query.mockResolvedValueOnce({ rows: [] })
    db.query.mockResolvedValueOnce({ rows: [{ count: '15' }] })

    await listar(req, res, next)

    expect(db.query.mock.calls[0][1]).toEqual(['10', expect.any(Number)])
  })
})
