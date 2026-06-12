const db = require('../config/database')

async function getContagemRespostas(pesquisa_id, pergunta_id) {
  const result = await db.query(
    `SELECT resposta->>'valor' AS valor, COUNT(*) AS quantidade
     FROM respostas WHERE pesquisa_id = $1 AND pergunta_id = $2
     GROUP BY resposta->>'valor' ORDER BY quantidade DESC`,
    [pesquisa_id, pergunta_id]
  )
  return result.rows
}

async function getEstatisticasNumericas(pesquisa_id, pergunta_id) {
  const result = await db.query(
    `SELECT AVG((resposta->>'valor')::numeric) AS media,
            MIN((resposta->>'valor')::numeric) AS minimo,
            MAX((resposta->>'valor')::numeric) AS maximo
     FROM respostas WHERE pesquisa_id = $1 AND pergunta_id = $2`,
    [pesquisa_id, pergunta_id]
  )
  return result.rows[0]
}

async function getPerfilEntrevistados(pesquisa_id) {
  const result = await db.query(
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
  )
  return result.rows[0] || {}
}

async function getTotalEntrevistados(pesquisa_id) {
  const result = await db.query(
    'SELECT COUNT(DISTINCT entrevistado_id) FROM respostas WHERE pesquisa_id = $1', [pesquisa_id]
  )
  return parseInt(result.rows[0].count)
}

module.exports = {
  getContagemRespostas,
  getEstatisticasNumericas,
  getPerfilEntrevistados,
  getTotalEntrevistados,
}
