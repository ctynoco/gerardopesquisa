const { distribuicao } = require('../../../src/controllers/geograficoController')

jest.mock('../../../src/config/database', () => ({
  query: jest.fn(),
}))

const db = require('../../../src/config/database')

function mockReq(params = {}) {
  return { params }
}

function mockRes() {
  const res = {}
  res.status = jest.fn().mockReturnValue(res)
  res.json = jest.fn().mockReturnValue(res)
  return res
}

describe('geograficoController', () => {
  beforeEach(() => { jest.clearAllMocks() })

  it('deve retornar distribuição geográfica', async () => {
    const req = mockReq({ pesquisa_id: '1' })
    const res = mockRes()
    const next = jest.fn()

    db.query.mockResolvedValueOnce({ rows: [{ estado: 'SP', quantidade: 10 }, { estado: 'RJ', quantidade: 5 }] })
    db.query.mockResolvedValueOnce({ rows: [{ cidade: 'São Paulo', estado: 'SP', quantidade: 8 }] })

    await distribuicao(req, res, next)

    expect(res.json).toHaveBeenCalledWith({
      estados: [{ estado: 'SP', quantidade: 10 }, { estado: 'RJ', quantidade: 5 }],
      cidades: [{ cidade: 'São Paulo', estado: 'SP', quantidade: 8 }],
    })
  })

  it('deve retornar arrays vazios se não houver dados', async () => {
    const req = mockReq({ pesquisa_id: '999' })
    const res = mockRes()
    const next = jest.fn()

    db.query.mockResolvedValueOnce({ rows: [] })
    db.query.mockResolvedValueOnce({ rows: [] })

    await distribuicao(req, res, next)

    expect(res.json).toHaveBeenCalledWith({ estados: [], cidades: [] })
  })
})
