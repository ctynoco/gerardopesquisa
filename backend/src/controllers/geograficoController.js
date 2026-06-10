const db = require('../config/database')

async function distribuicao(req, res, next) {
  try {
    const { pesquisa_id } = req.params
    const estados = await db.query(
      `SELECT e.estado, COUNT(*) AS quantidade
       FROM entrevistados e
       WHERE e.pesquisa_id = $1 AND e.estado IS NOT NULL
       GROUP BY e.estado ORDER BY quantidade DESC`, [pesquisa_id]
    )
    const cidades = await db.query(
      `SELECT e.cidade, e.estado, COUNT(*) AS quantidade
       FROM entrevistados e
       WHERE e.pesquisa_id = $1 AND e.cidade IS NOT NULL
       GROUP BY e.cidade, e.estado ORDER BY quantidade DESC`, [pesquisa_id]
    )
    res.json({ estados: estados.rows, cidades: cidades.rows })
  } catch (err) { next(err) }
}

module.exports = { distribuicao }
