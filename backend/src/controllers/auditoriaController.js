const db = require('../config/database')

async function listar(req, res, next) {
  try {
    const { page = 1, limit = 50 } = req.query
    const offset = (page - 1) * limit
    const result = await db.query(
      `SELECT a.*, u.nome AS usuario_nome
       FROM auditoria a
       LEFT JOIN usuarios u ON u.id = a.usuario_id
       ORDER BY a.created_at DESC
       LIMIT $1 OFFSET $2`, [limit, offset]
    )
    const count = await db.query('SELECT COUNT(*) FROM auditoria')
    res.json({ auditoria: result.rows, total: parseInt(count.rows[0].count) })
  } catch (err) { next(err) }
}

module.exports = { listar }
