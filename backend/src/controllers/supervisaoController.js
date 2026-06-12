const db = require('../config/database')

async function painelSupervisao(req, res, next) {
  try {
    const { pesquisa_id } = req.params
    const periodo = parseInt(req.query.minutos) || 15

    const [totalRes, ultimasRes, ativosRes, hojeRes, entrevistadoresRes] = await Promise.all([
      db.query('SELECT COUNT(*)::int AS total FROM entrevistados WHERE pesquisa_id = $1', [pesquisa_id]),
      db.query(
        `SELECT e.id, e.nome, e.bairro, e.cidade, e.created_at,
                u.nome AS entrevistador
         FROM entrevistados e
         LEFT JOIN usuarios u ON u.id = e.entrevistador_id
         WHERE e.pesquisa_id = $1
         ORDER BY e.created_at DESC LIMIT 20`, [pesquisa_id]
      ),
      db.query(
        `SELECT COALESCE(COUNT(DISTINCT e.entrevistador_id), 0)::int AS ativos
         FROM entrevistados e
         WHERE e.pesquisa_id = $1
           AND e.created_at > NOW() - ($2 || ' minutes')::interval`,
        [pesquisa_id, String(periodo)]
      ),
      db.query(
        `SELECT COUNT(*)::int AS hoje
         FROM entrevistados e
         WHERE e.pesquisa_id = $1
           AND e.created_at::date = CURRENT_DATE`, [pesquisa_id]
      ),
      db.query(
        `SELECT u.id, u.nome, COUNT(e.id)::int AS total,
                MAX(e.created_at) AS ultima_atividade
         FROM usuarios u
         LEFT JOIN entrevistados e ON e.entrevistador_id = u.id AND e.pesquisa_id = $1
         WHERE u.perfil = 'entrevistador'
         GROUP BY u.id, u.nome
         ORDER BY total DESC`, [pesquisa_id]
      ),
    ])

    res.json({
      total: totalRes.rows[0].total,
      ultimas: ultimasRes.rows,
      ativos: ativosRes.rows[0].ativos,
      hoje: hojeRes.rows[0].hoje,
      entrevistadores: entrevistadoresRes.rows,
    })
  } catch (err) { next(err) }
}

module.exports = { painelSupervisao }
