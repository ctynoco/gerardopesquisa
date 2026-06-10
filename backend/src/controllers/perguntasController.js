const db = require('../config/database')

async function listar(req, res, next) {
  try {
    const { pesquisa_id } = req.query
    let where = ''
    const params = []
    if (pesquisa_id) {
      params.push(pesquisa_id)
      where = 'WHERE pesquisa_id = $1'
    }
    const result = await db.query(
      `SELECT * FROM perguntas ${where} ORDER BY ordenacao, id`, params
    )
    res.json({ perguntas: result.rows })
  } catch (err) { next(err) }
}

async function obter(req, res, next) {
  try {
    const result = await db.query('SELECT * FROM perguntas WHERE id = $1', [req.params.id])
    if (!result.rows.length) return res.status(404).json({ error: 'Pergunta não encontrada' })
    res.json({ pergunta: result.rows[0] })
  } catch (err) { next(err) }
}

async function criar(req, res, next) {
  try {
    const { pesquisa_id, tipo, titulo, descricao, opcoes, ordenacao, obrigatoria } = req.body
    if (!pesquisa_id || !tipo || !titulo) {
      return res.status(400).json({ error: 'pesquisa_id, tipo e titulo são obrigatórios' })
    }
    const tiposValidos = ['texto', 'multipla_escolha', 'unica_escolha', 'numerica', 'data', 'likert', 'aberta']
    if (!tiposValidos.includes(tipo)) {
      return res.status(400).json({ error: `Tipo inválido. Válidos: ${tiposValidos.join(', ')}` })
    }
    const result = await db.query(
      `INSERT INTO perguntas (pesquisa_id, tipo, titulo, descricao, opcoes, ordenacao, obrigatoria)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [pesquisa_id, tipo, titulo, descricao, opcoes ? JSON.stringify(opcoes) : null, ordenacao || 0, obrigatoria !== false]
    )
    res.status(201).json({ pergunta: result.rows[0] })
  } catch (err) { next(err) }
}

async function atualizar(req, res, next) {
  try {
    const { tipo, titulo, descricao, opcoes, ordenacao, obrigatoria } = req.body
    const result = await db.query(
      `UPDATE perguntas SET tipo = $1, titulo = $2, descricao = $3, opcoes = $4, ordenacao = $5, obrigatoria = $6, updated_at = NOW()
       WHERE id = $7 RETURNING *`,
      [tipo, titulo, descricao, opcoes ? JSON.stringify(opcoes) : null, ordenacao, obrigatoria, req.params.id]
    )
    if (!result.rows.length) return res.status(404).json({ error: 'Pergunta não encontrada' })
    res.json({ pergunta: result.rows[0] })
  } catch (err) { next(err) }
}

async function remover(req, res, next) {
  try {
    const result = await db.query('DELETE FROM perguntas WHERE id = $1 RETURNING id', [req.params.id])
    if (!result.rows.length) return res.status(404).json({ error: 'Pergunta não encontrada' })
    res.json({ message: 'Pergunta removida' })
  } catch (err) { next(err) }
}

async function reordenar(req, res, next) {
  try {
    const { ordem } = req.body
    if (!Array.isArray(ordem)) return res.status(400).json({ error: 'ordem deve ser um array de {id, ordenacao}' })
    for (const item of ordem) {
      await db.query('UPDATE perguntas SET ordenacao = $1 WHERE id = $2', [item.ordenacao, item.id])
    }
    res.json({ message: 'Ordem atualizada' })
  } catch (err) { next(err) }
}

module.exports = { listar, obter, criar, atualizar, remover, reordenar }
