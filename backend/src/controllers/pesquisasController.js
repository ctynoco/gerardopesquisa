const db = require('../config/database')

async function listar(req, res, next) {
  try {
    const { page = 1, limit = 20, status } = req.query
    const offset = (page - 1) * limit
    let where = ''
    const params = []
    if (status) {
      params.push(status)
      where = `WHERE p.status = $${params.length}`
    }
    params.push(limit, offset)
    const result = await db.query(
      `SELECT p.*, u.nome AS criador,
        (SELECT COUNT(*) FROM entrevistados e WHERE e.pesquisa_id = p.id) AS total_entrevistados
       FROM pesquisas p
       JOIN usuarios u ON u.id = p.created_by
       ${where}
       ORDER BY p.created_at DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`, params
    )
    const countParams = status ? [status] : []
    const count = await db.query(
      `SELECT COUNT(*) FROM pesquisas p ${where}`,
      countParams
    )
    res.json({ pesquisas: result.rows, total: parseInt(count.rows[0].count), page: Number(page) })
  } catch (err) { next(err) }
}

async function obter(req, res, next) {
  try {
    const result = await db.query(
      `SELECT p.*, u.nome AS criador
       FROM pesquisas p JOIN usuarios u ON u.id = p.created_by
       WHERE p.id = $1`, [req.params.id]
    )
    if (!result.rows.length) return res.status(404).json({ error: 'Pesquisa não encontrada' })
    res.json({ pesquisa: result.rows[0] })
  } catch (err) { next(err) }
}

async function criar(req, res, next) {
  try {
    const { titulo, descricao, margem_erro, nivel_confianca, tamanho_amostra, populacao_alvo, data_inicio, data_fim } = req.body
    if (!titulo) return res.status(400).json({ error: 'Título é obrigatório' })
    const result = await db.query(
      `INSERT INTO pesquisas (titulo, descricao, margem_erro, nivel_confianca, tamanho_amostra, populacao_alvo, data_inicio, data_fim, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [titulo, descricao, margem_erro, nivel_confianca, tamanho_amostra, populacao_alvo, data_inicio, data_fim, req.usuario.id]
    )
    res.status(201).json({ pesquisa: result.rows[0] })
  } catch (err) { next(err) }
}

async function atualizar(req, res, next) {
  try {
    const { titulo, descricao, status, margem_erro, nivel_confianca, tamanho_amostra, populacao_alvo, data_inicio, data_fim } = req.body
    const result = await db.query(
      `UPDATE pesquisas SET titulo = $1, descricao = $2, status = $3, margem_erro = $4, nivel_confianca = $5,
        tamanho_amostra = $6, populacao_alvo = $7, data_inicio = $8, data_fim = $9, updated_at = NOW()
       WHERE id = $10 RETURNING *`,
      [titulo, descricao, status, margem_erro, nivel_confianca, tamanho_amostra, populacao_alvo, data_inicio, data_fim, req.params.id]
    )
    if (!result.rows.length) return res.status(404).json({ error: 'Pesquisa não encontrada' })
    res.json({ pesquisa: result.rows[0] })
  } catch (err) { next(err) }
}

async function remover(req, res, next) {
  try {
    const result = await db.query('DELETE FROM pesquisas WHERE id = $1 RETURNING id', [req.params.id])
    if (!result.rows.length) return res.status(404).json({ error: 'Pesquisa não encontrada' })
    res.json({ message: 'Pesquisa removida' })
  } catch (err) { next(err) }
}

module.exports = { listar, obter, criar, atualizar, remover }
