const errorHandler = require('../../../src/middleware/errorHandler')

function mockRes() {
  const res = {}
  res.status = jest.fn().mockReturnValue(res)
  res.json = jest.fn().mockReturnValue(res)
  return res
}

describe('errorHandler', () => {
  it('deve retornar 409 para erro de unique violation (23505)', () => {
    const err = { code: '23505', message: 'duplicate key' }
    const req = {}
    const res = mockRes()
    const next = jest.fn()

    errorHandler(err, req, res, next)

    expect(res.status).toHaveBeenCalledWith(409)
    expect(res.json).toHaveBeenCalledWith({ error: 'Registro duplicado' })
  })

  it('deve retornar 400 para erro de foreign key violation (23503)', () => {
    const err = { code: '23503', message: 'foreign key violation' }
    const req = {}
    const res = mockRes()
    const next = jest.fn()

    errorHandler(err, req, res, next)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({ error: 'Registro referenciado não encontrado' })
  })

  it('deve retornar 400 para ValidationError', () => {
    const err = { name: 'ValidationError', message: 'Campo inválido' }
    const req = {}
    const res = mockRes()
    const next = jest.fn()

    errorHandler(err, req, res, next)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({ error: 'Campo inválido' })
  })

  it('deve retornar 500 para erros desconhecidos', () => {
    const err = { message: 'Algo deu errado' }
    const req = {}
    const res = mockRes()
    const next = jest.fn()

    errorHandler(err, req, res, next)

    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.json).toHaveBeenCalledWith({ error: 'Algo deu errado' })
  })

  it('deve usar status personalizado se fornecido', () => {
    const err = { status: 422, message: 'Entidade não processável' }
    const req = {}
    const res = mockRes()
    const next = jest.fn()

    errorHandler(err, req, res, next)

    expect(res.status).toHaveBeenCalledWith(422)
    expect(res.json).toHaveBeenCalledWith({ error: 'Entidade não processável' })
  })
})
