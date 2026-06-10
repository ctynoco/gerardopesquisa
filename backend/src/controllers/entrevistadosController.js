const db = require('../config/database')
const crypto = require('crypto')

async function listar(req, res, next) {
  try {
    const { page = 1, limit = 50, pesquisa_id } = req.query
    const offset = (page - 1) * limit
    let where = ''
    const params = []
    if (pesquisa_id) {
      params.push(pesquisa_id)
      where = 'WHERE e.pesquisa_id = $1'
    }
    params.push(limit, offset)
    const result = await db.query(
      `SELECT e.*, p.titulo AS pesquisa_titulo
       FROM entrevistados e
       JOIN pesquisas p ON p.id = e.pesquisa_id
       ${where}
       ORDER BY e.created_at DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`, params
    )
    const count = await db.query('SELECT COUNT(*) FROM entrevistados')
    res.json({ entrevistados: result.rows, total: parseInt(count.rows[0].count), page: Number(page) })
  } catch (err) { next(err) }
}

async function obter(req, res, next) {
  try {
    const result = await db.query(
      `SELECT e.*, p.titulo AS pesquisa_titulo
       FROM entrevistados e
       JOIN pesquisas p ON p.id = e.pesquisa_id
       WHERE e.id = $1`, [req.params.id]
    )
    if (!result.rows.length) return res.status(404).json({ error: 'Entrevistado não encontrado' })
    res.json({ entrevistado: result.rows[0] })
  } catch (err) { next(err) }
}

async function criar(req, res, next) {
  try {
    const { pesquisa_id, nome, idade, genero, cidade, estado, escolaridade, renda_familiar, ocupacao, zona_eleitoral, sessao_eleitoral, consentimento_lgpd } = req.body
    if (!pesquisa_id) return res.status(400).json({ error: 'pesquisa_id é obrigatório' })
    const token = crypto.randomBytes(16).toString('hex')
    const result = await db.query(
      `INSERT INTO entrevistados (pesquisa_id, nome, idade, genero, cidade, estado, escolaridade, renda_familiar, ocupacao, zona_eleitoral, sessao_eleitoral, consentimento_lgpd, token_anonimizacao)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *`,
      [pesquisa_id, nome, idade, genero, cidade, estado, escolaridade, renda_familiar, ocupacao, zona_eleitoral, sessao_eleitoral, consentimento_lgpd || false, token]
    )
    res.status(201).json({ entrevistado: result.rows[0] })
  } catch (err) { next(err) }
}

async function atualizar(req, res, next) {
  try {
    const { nome, idade, genero, cidade, estado, escolaridade, renda_familiar, ocupacao, zona_eleitoral, sessao_eleitoral, consentimento_lgpd } = req.body
    const result = await db.query(
      `UPDATE entrevistados SET nome = $1, idade = $2, genero = $3, cidade = $4, estado = $5,
        escolaridade = $6, renda_familiar = $7, ocupacao = $8, zona_eleitoral = $9, sessao_eleitoral = $10, consentimento_lgpd = $11
       WHERE id = $12 RETURNING *`,
      [nome, idade, genero, cidade, estado, escolaridade, renda_familiar, ocupacao, zona_eleitoral, sessao_eleitoral, consentimento_lgpd, req.params.id]
    )
    if (!result.rows.length) return res.status(404).json({ error: 'Entrevistado não encontrado' })
    res.json({ entrevistado: result.rows[0] })
  } catch (err) { next(err) }
}

async function remover(req, res, next) {
  try {
    const result = await db.query('DELETE FROM entrevistados WHERE id = $1 RETURNING id', [req.params.id])
    if (!result.rows.length) return res.status(404).json({ error: 'Entrevistado não encontrado' })
    res.json({ message: 'Entrevistado removido' })
  } catch (err) { next(err) }
}

module.exports = { listar, obter, criar, atualizar, remover }
