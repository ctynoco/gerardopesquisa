const db = require('../config/database')

async function apuracao(req, res, next) {
  try {
    const { pesquisa_id } = req.params
    const perguntas = await db.query(
      `SELECT id, titulo, tipo FROM perguntas WHERE pesquisa_id = $1 AND ativa = true ORDER BY ordem`, [pesquisa_id]
    )
    const results = await Promise.all(perguntas.rows.map(async (p) => {
      const respostas = await db.query(
        `SELECT r.resposta, COUNT(*)::int AS quantidade
         FROM respostas r
         JOIN entrevistados e ON e.id = r.entrevistado_id
         WHERE r.pergunta_id = $1 AND e.pesquisa_id = $2
         GROUP BY r.resposta ORDER BY quantidade DESC`,
        [p.id, pesquisa_id]
      )
      const total = respostas.rows.reduce((s, r) => s + r.quantidade, 0)
      return {
        pergunta_id: p.id,
        titulo: p.titulo,
        tipo: p.tipo,
        total,
        respostas: respostas.rows.map((r) => ({
          label: r.resposta,
          votos: r.quantidade,
          pct: total > 0 ? ((r.quantidade / total) * 100).toFixed(1) : '0.0',
        })),
      }
    }))
    res.json(results)
  } catch (err) { next(err) }
}

async function evolucao(req, res, next) {
  try {
    const { pesquisa_id } = req.params
    const periodo = req.query.periodo || 'hour'
    const intervalo = periodo === 'day' ? 'day' : 'hour'

    const perguntas = await db.query(
      `SELECT id, titulo FROM perguntas WHERE pesquisa_id = $1 AND ativa = true ORDER BY ordem`, [pesquisa_id]
    )

    const results = await Promise.all(perguntas.rows.map(async (p) => {
      const dados = await db.query(
        `SELECT
           date_trunc($1, r.created_at) AS periodo,
           r.resposta,
           COUNT(*)::int AS quantidade
         FROM respostas r
         JOIN entrevistados e ON e.id = r.entrevistado_id
         WHERE r.pergunta_id = $2 AND e.pesquisa_id = $3
         GROUP BY periodo, r.resposta
         ORDER BY periodo`, [intervalo, p.id, pesquisa_id]
      )
      return { pergunta_id: p.id, titulo: p.titulo, dados: dados.rows }
    }))
    res.json(results)
  } catch (err) { next(err) }
}

module.exports = { apuracao, evolucao }
