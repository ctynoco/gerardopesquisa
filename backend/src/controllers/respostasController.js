const db = require('../config/database')

async function listar(req, res, next) {
  try {
    const { pesquisa_id, entrevistado_id } = req.query
    const params = []
    let where = ''
    if (pesquisa_id) { params.push(pesquisa_id); where = 'WHERE r.pesquisa_id = $1' }
    if (entrevistado_id) {
      params.push(entrevistado_id)
      where = where ? `${where} AND r.entrevistado_id = $${params.length}` : `WHERE r.entrevistado_id = $1`
    }
    const result = await db.query(
      `SELECT r.*, p.titulo AS pergunta_titulo, p.tipo AS pergunta_tipo
       FROM respostas r
       JOIN perguntas p ON p.id = r.pergunta_id
       ${where}
       ORDER BY r.created_at`, params
    )
    res.json({ respostas: result.rows })
  } catch (err) { next(err) }
}

async function criar(req, res, next) {
  try {
    const { pesquisa_id, pergunta_id, entrevistado_id, resposta } = req.body
    if (!pesquisa_id || !pergunta_id || !entrevistado_id || resposta === undefined) {
      return res.status(400).json({ error: 'pesquisa_id, pergunta_id, entrevistado_id e resposta são obrigatórios' })
    }
    const result = await db.query(
      `INSERT INTO respostas (pesquisa_id, pergunta_id, entrevistado_id, resposta)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (pergunta_id, entrevistado_id)
       DO UPDATE SET resposta = $4, created_at = NOW()
       RETURNING *`,
      [pesquisa_id, pergunta_id, entrevistado_id, JSON.stringify(resposta)]
    )
    res.status(201).json({ resposta: result.rows[0] })
  } catch (err) { next(err) }
}

async function estatisticas(req, res, next) {
  try {
    const { pesquisa_id } = req.params
    if (!pesquisa_id) return res.status(400).json({ error: 'pesquisa_id é obrigatório' })

    const perguntas = await db.query(
      'SELECT id, titulo, tipo, opcoes FROM perguntas WHERE pesquisa_id = $1 ORDER BY ordenacao', [pesquisa_id]
    )

    const resultados = []
    for (const pergunta of perguntas.rows) {
      const respostas = await db.query(
        'SELECT resposta FROM respostas WHERE pesquisa_id = $1 AND pergunta_id = $2',
        [pesquisa_id, pergunta.id]
      )

      let dados = { pergunta_id: pergunta.id, titulo: pergunta.titulo, tipo: pergunta.tipo, total: respostas.rows.length }

      if (pergunta.tipo === 'multipla_escolha' || pergunta.tipo === 'unica_escolha' || pergunta.tipo === 'likert') {
        const contagem = await db.query(
          `SELECT resposta->>'valor' AS valor, COUNT(*) AS quantidade
           FROM respostas WHERE pesquisa_id = $1 AND pergunta_id = $2
           GROUP BY resposta->>'valor' ORDER BY quantidade DESC`,
          [pesquisa_id, pergunta.id]
        )
        dados.opcoes = pergunta.opcoes
        dados.contagem = contagem.rows
      }

      if (pergunta.tipo === 'numerica') {
        const stats = await db.query(
          `SELECT AVG((resposta->>'valor')::numeric) AS media,
                  MIN((resposta->>'valor')::numeric) AS minimo,
                  MAX((resposta->>'valor')::numeric) AS maximo
           FROM respostas WHERE pesquisa_id = $1 AND pergunta_id = $2`,
          [pesquisa_id, pergunta.id]
        )
        dados.estatisticas = stats.rows[0]
      }

      resultados.push(dados)
    }

    const [totalEntrevistados, perfilRes] = await Promise.all([
      db.query('SELECT COUNT(DISTINCT entrevistado_id) FROM respostas WHERE pesquisa_id = $1', [pesquisa_id]),
      db.query(
        `SELECT
           (SELECT json_agg(json_build_object('valor', genero, 'quantidade', qtd) ORDER BY qtd DESC)
            FROM (SELECT COALESCE(genero, 'N/I') AS genero, COUNT(*)::int AS qtd FROM entrevistados WHERE pesquisa_id = $1 GROUP BY genero) sub) AS genero,
           (SELECT json_agg(json_build_object('valor', faixa, 'quantidade', qtd) ORDER BY qtd DESC)
            FROM (SELECT CASE WHEN idade < 18 THEN '16-17' WHEN idade <= 24 THEN '18-24' WHEN idade <= 34 THEN '25-34' WHEN idade <= 44 THEN '35-44' WHEN idade <= 59 THEN '45-59' ELSE '60+' END AS faixa, COUNT(*)::int AS qtd FROM entrevistados WHERE pesquisa_id = $1 AND idade IS NOT NULL GROUP BY faixa) sub) AS idade,
           (SELECT json_agg(json_build_object('valor', escolaridade, 'quantidade', qtd) ORDER BY qtd DESC)
            FROM (SELECT COALESCE(escolaridade, 'N/I') AS escolaridade, COUNT(*)::int AS qtd FROM entrevistados WHERE pesquisa_id = $1 GROUP BY escolaridade) sub) AS escolaridade,
           (SELECT json_agg(json_build_object('valor', renda, 'quantidade', qtd) ORDER BY qtd DESC)
            FROM (SELECT COALESCE(renda_familiar, 'N/I') AS renda, COUNT(*)::int AS qtd FROM entrevistados WHERE pesquisa_id = $1 GROUP BY renda) sub) AS renda`,
        [pesquisa_id]
      ),
    ])

    res.json({
      pesquisa_id: Number(pesquisa_id),
      total_entrevistados: parseInt(totalEntrevistados.rows[0].count),
      perguntas: resultados,
      perfil: perfilRes.rows[0] || {},
    })
  } catch (err) { next(err) }
}

module.exports = { listar, criar, estatisticas }
