function errorHandler(err, req, res, next) {
  console.error(`[ERROR] ${err.message}`, err.stack)

  if (err.code === '23505') {
    return res.status(409).json({ error: 'Registro duplicado' })
  }

  if (err.code === '23503') {
    return res.status(400).json({ error: 'Registro referenciado não encontrado' })
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message })
  }

  const status = err.status || 500
  res.status(status).json({
    error: err.message || 'Erro interno do servidor',
  })
}

module.exports = errorHandler
