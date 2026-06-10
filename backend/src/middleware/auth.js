const jwt = require('jsonwebtoken')
const db = require('../config/database')

async function authenticate(req, res, next) {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token não fornecido' })
  }

  const token = header.split(' ')[1]

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const result = await db.query('SELECT id, nome, telefone, perfil, ativo FROM usuarios WHERE id = $1', [decoded.id])

    if (!result.rows.length || !result.rows[0].ativo) {
      return res.status(401).json({ error: 'Usuário não encontrado ou inativo' })
    }

    req.usuario = result.rows[0]
    next()
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido ou expirado' })
  }
}

function authorize(...perfis) {
  return (req, res, next) => {
    if (!req.usuario || !perfis.includes(req.usuario.perfil)) {
      return res.status(403).json({ error: 'Acesso não autorizado' })
    }
    next()
  }
}

module.exports = { authenticate, authorize }
