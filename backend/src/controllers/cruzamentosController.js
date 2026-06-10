const db = require('../config/database')

async function cruzamentos(req, res, next) {
  try {
    const { pesquisa_id } = req.params
    const { agrupar_por = 'genero' } = req.query

    const allowed = ['genero', 'escolaridade', 'renda_familiar', 'cidade', 'estado']
    if (!allowed.includes(agrupar_por)) {
      return res.status(400).json({ error: `agrupar_por deve ser um de: ${allowed.join(', ')}` })
    }

    const perguntas = await db.query(
      `SELECT id, titulo, tipo, opcoes FROM perguntas WHERE pesquisa_id = $1 ORDER BY ordenacao`,
      [pesquisa_id]
    )

    const resultados = []
    for (const pergunta of perguntas.rows) {
      const dados = await db.query(
        `SELECT r.pergunta_id, r.resposta->>'valor' AS resposta_valor,
                e.${agrupar_por} AS grupo, COUNT(*) AS quantidade
         FROM respostas r
         JOIN entrevistados e ON e.id = r.entrevistado_id
         WHERE r.pesquisa_id = $1 AND r.pergunta_id = $2
         GROUP BY r.pergunta_id, resposta_valor, e.${agrupar_por}
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

module.exports = { cruzamentos }
