const db = require('../config/database')

async function cruzamentos(req, res, next) {
  try {
    const { pesquisa_id } = req.params
    const { agrupar_por = 'genero' } = req.query

    const colunas = { genero: 'e.genero', escolaridade: 'e.escolaridade', renda_familiar: 'e.renda_familiar', cidade: 'e.cidade', estado: 'e.estado' }
    const grupoCol = colunas[agrupar_por]
    if (!grupoCol) {
      return res.status(400).json({ error: `agrupar_por deve ser um de: ${Object.keys(colunas).join(', ')}` })
    }

    const perguntas = await db.query(
      `SELECT id, titulo, tipo, opcoes FROM perguntas WHERE pesquisa_id = $1 ORDER BY ordenacao`,
      [pesquisa_id]
    )

    const resultados = []
    for (const pergunta of perguntas.rows) {
      const dados = await db.query(
        `SELECT r.pergunta_id, r.resposta->>'valor' AS resposta_valor,
                ${grupoCol} AS grupo, COUNT(*) AS quantidade
         FROM respostas r
         JOIN entrevistados e ON e.id = r.entrevistado_id
         WHERE r.pesquisa_id = $1 AND r.pergunta_id = $2
         GROUP BY r.pergunta_id, resposta_valor, ${grupoCol}
         ORDER BY resposta_valor, grupo`,
        [pesquisa_id, pergunta.id]
      )

      const grupos = [...new Set(dados.rows.map((r) => r.grupo))]
      const valores = [...new Set(dados.rows.map((r) => r.resposta_valor))]

      const linhas = valores.map((valor) => {
        const linha = { valor }
        for (const g of grupos) {
          const encontrado = dados.rows.find((r) => r.resposta_valor === valor && r.grupo === g)
          linha[g] = encontrado ? parseInt(encontrado.quantidade) : 0
        }
        return linha
      })

      resultados.push({
        pergunta_id: pergunta.id,
        titulo: pergunta.titulo,
        tipo: pergunta.tipo,
        opcoes: pergunta.opcoes,
        grupos,
        linhas,
      })
    }

    const totalEntrevistados = await db.query(
      'SELECT COUNT(DISTINCT entrevistado_id) FROM respostas WHERE pesquisa_id = $1', [pesquisa_id]
    )

    res.json({
      pesquisa_id: Number(pesquisa_id),
      total_entrevistados: parseInt(totalEntrevistados.rows[0].count),
      agrupado_por: agrupar_por,
      perguntas: resultados,
    })
  } catch (err) {
    next(err)
  }
}

async function cruzamentosCompleto(req, res, next) {
  try {
    const { pesquisa_id } = req.params

    const perguntas = await db.query(
      `SELECT id, titulo, tipo, opcoes FROM perguntas WHERE pesquisa_id = $1 ORDER BY ordenacao`,
      [pesquisa_id]
    )

    async function queryDim(sql, col) {
      const r = await db.query(sql, [pesquisa_id])
      const map = {}
      for (const row of r.rows) {
        const key = `${row.pergunta_id}::${row.resposta_valor}`
        if (!map[key]) map[key] = {}
        map[key][row[col]] = parseInt(row.quantidade)
      }
      return map
    }

    const [genero, escolaridade, renda, idadeFaixa, idadeMedia] = await Promise.all([
      queryDim(
        `SELECT r.pergunta_id, r.resposta->>'valor' AS resposta_valor, e.genero, COUNT(*) AS quantidade
         FROM respostas r JOIN entrevistados e ON e.id = r.entrevistado_id
         WHERE r.pesquisa_id = $1 AND e.genero IS NOT NULL
         GROUP BY r.pergunta_id, resposta_valor, e.genero`, 'genero'),
      queryDim(
        `SELECT r.pergunta_id, r.resposta->>'valor' AS resposta_valor, e.escolaridade, COUNT(*) AS quantidade
         FROM respostas r JOIN entrevistados e ON e.id = r.entrevistado_id
         WHERE r.pesquisa_id = $1 AND e.escolaridade IS NOT NULL
         GROUP BY r.pergunta_id, resposta_valor, e.escolaridade`, 'escolaridade'),
      queryDim(
        `SELECT r.pergunta_id, r.resposta->>'valor' AS resposta_valor, e.renda_familiar, COUNT(*) AS quantidade
         FROM respostas r JOIN entrevistados e ON e.id = r.entrevistado_id
         WHERE r.pesquisa_id = $1 AND e.renda_familiar IS NOT NULL
         GROUP BY r.pergunta_id, resposta_valor, e.renda_familiar`, 'renda_familiar'),
      queryDim(
        `SELECT r.pergunta_id, r.resposta->>'valor' AS resposta_valor,
           CASE
             WHEN e.idade BETWEEN 16 AND 24 THEN '16 a 24'
             WHEN e.idade BETWEEN 25 AND 34 THEN '25 a 34'
             WHEN e.idade BETWEEN 35 AND 44 THEN '35 a 44'
             WHEN e.idade BETWEEN 45 AND 59 THEN '45 a 59'
             ELSE '60+'
           END AS idade, COUNT(*) AS quantidade
         FROM respostas r JOIN entrevistados e ON e.id = r.entrevistado_id
         WHERE r.pesquisa_id = $1 AND e.idade IS NOT NULL
         GROUP BY r.pergunta_id, resposta_valor, idade`, 'idade'),
    ])

    const idadeMediaRows = await db.query(
      `SELECT r.pergunta_id, r.resposta->>'valor' AS resposta_valor, AVG(e.idade)::numeric(10,1) AS idade_media
       FROM respostas r JOIN entrevistados e ON e.id = r.entrevistado_id
       WHERE r.pesquisa_id = $1 AND e.idade IS NOT NULL
       GROUP BY r.pergunta_id, resposta_valor`, [pesquisa_id]
    )

    const idadeMediaMap = {}
    for (const row of idadeMediaRows.rows) {
      idadeMediaMap[`${row.pergunta_id}::${row.resposta_valor}`] = parseFloat(row.idade_media)
    }

    const resultados = perguntas.rows.map((p) => {
      const respostas = [...new Set(
        [...Object.keys(genero), ...Object.keys(escolaridade), ...Object.keys(renda), ...Object.keys(idadeFaixa)]
          .filter((k) => k.startsWith(`${p.id}::`))
          .map((k) => k.split('::')[1])
      )]
      const linhas = respostas.map((valor) => {
        const key = `${p.id}::${valor}`
        return {
          valor,
          total: Object.values(genero[key] || {}).reduce((s, v) => s + v, 0) +
                 Object.values(escolaridade[key] || {}).reduce((s, v) => s + v, 0) +
                 Object.values(renda[key] || {}).reduce((s, v) => s + v, 0) +
                 Object.values(idadeFaixa[key] || {}).reduce((s, v) => s + v, 0),
          genero: genero[key] || {},
          escolaridade: escolaridade[key] || {},
          renda: renda[key] || {},
          idade: idadeFaixa[key] || {},
          idade_media: idadeMediaMap[key] || null,
        }
      })
      const totalGeral = linhas.reduce((s, l) => s + l.total, 0)
      return {
        pergunta_id: p.id,
        titulo: p.titulo,
        tipo: p.tipo,
        opcoes: p.opcoes,
        total_geral: totalGeral || linhas.reduce((s, l) => {
          const vals = Object.values(l.genero)
          return s + (vals.length ? vals.reduce((a, b) => a + b, 0) : 0)
        }, 0),
        linhas,
      }
    })

    const totalEntrevistados = await db.query(
      'SELECT COUNT(DISTINCT entrevistado_id) FROM respostas WHERE pesquisa_id = $1', [pesquisa_id]
    )

    res.json({
      pesquisa_id: Number(pesquisa_id),
      total_entrevistados: parseInt(totalEntrevistados.rows[0].count),
      perguntas: resultados,
    })
  } catch (err) {
    next(err)
  }
}

module.exports = { cruzamentos, cruzamentosCompleto }
