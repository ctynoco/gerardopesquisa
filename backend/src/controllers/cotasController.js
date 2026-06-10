const db = require('../config/database')

async function getCotas(req, res, next) {
  try {
    const { pesquisa_id } = req.params
    const pesq = await db.query('SELECT id, titulo, tamanho_amostra, cotas, cotas_ativas FROM pesquisas WHERE id = $1', [pesquisa_id])
    if (!pesq.rows.length) return res.status(404).json({ error: 'Pesquisa não encontrada' })
    const p = pesq.rows[0]

    const entrevistados = await db.query(
      `SELECT genero,
              CASE
                WHEN idade BETWEEN 16 AND 24 THEN '16 a 24'
                WHEN idade BETWEEN 25 AND 34 THEN '25 a 34'
                WHEN idade BETWEEN 35 AND 44 THEN '35 a 44'
                WHEN idade BETWEEN 45 AND 59 THEN '45 a 59'
                WHEN idade >= 60 THEN '60+'
                ELSE NULL
              END AS faixa_idade,
              escolaridade, renda_familiar, bairro
       FROM entrevistados WHERE pesquisa_id = $1`,
      [pesquisa_id]
    )

    function contar(chave) {
      const map = {}
      for (const e of entrevistados.rows) {
        const val = e[chave]
        if (!val) continue
        map[val] = (map[val] || 0) + 1
      }
      return map
    }

    const progresso = {
      genero: contar('genero'),
      idade: contar('faixa_idade'),
      escolaridade: contar('escolaridade'),
      renda: contar('renda_familiar'),
      bairro: contar('bairro'),
    }

    const totalEntrevistados = entrevistados.rows.length

    res.json({
      pesquisa_id: Number(pesquisa_id),
      titulo: p.titulo,
      tamanho_amostra: p.tamanho_amostra,
      cotas_ativas: p.cotas_ativas,
      metas: p.cotas || {},
      progresso,
      total_entrevistados: totalEntrevistados,
    })
  } catch (err) { next(err) }
}

async function setCotas(req, res, next) {
  try {
    const { pesquisa_id } = req.params
    const { cotas, cotas_ativas } = req.body
    const pesq = await db.query('SELECT id FROM pesquisas WHERE id = $1', [pesquisa_id])
    if (!pesq.rows.length) return res.status(404).json({ error: 'Pesquisa não encontrada' })

    await db.query(
      `UPDATE pesquisas SET cotas = $1, cotas_ativas = $2, updated_at = NOW() WHERE id = $3`,
      [JSON.stringify(cotas || {}), cotas_ativas !== undefined ? cotas_ativas : false, pesquisa_id]
    )
    res.json({ message: 'Cotas atualizadas' })
  } catch (err) { next(err) }
}

module.exports = { getCotas, setCotas }
