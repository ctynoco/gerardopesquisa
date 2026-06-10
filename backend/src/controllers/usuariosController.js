const bcrypt = require('bcryptjs')
const db = require('../config/database')

async function listar(req, res, next) {
  try {
    const result = await db.query(
      'SELECT id, nome, email, perfil, ativo, created_at FROM usuarios ORDER BY created_at DESC'
    )
    res.json({ usuarios: result.rows })
  } catch (err) { next(err) }
}

async function criar(req, res, next) {
  try {
    const { nome, email, senha, perfil } = req.body
    if (!nome || !email || !senha) {
      return res.status(400).json({ error: 'Nome, email e senha são obrigatórios' })
    }
    const existente = await db.query('SELECT id FROM usuarios WHERE email = $1', [email])
    if (existente.rows.length) return res.status(409).json({ error: 'Email já cadastrado' })
    const senhaHash = await bcrypt.hash(senha, 10)
    const result = await db.query(
      'INSERT INTO usuarios (nome, email, senha, perfil) VALUES ($1, $2, $3, $4) RETURNING id, nome, email, perfil, ativo, created_at',
      [nome, email, senhaHash, perfil || 'entrevistador']
    )
    res.status(201).json({ usuario: result.rows[0] })
  } catch (err) { next(err) }
}

async function atualizar(req, res, next) {
  try {
    const { nome, email, perfil, ativo } = req.body
    const result = await db.query(
      'UPDATE usuarios SET nome = $1, email = $2, perfil = $3, ativo = $4 WHERE id = $5 RETURNING id, nome, email, perfil, ativo',
      [nome, email, perfil, ativo, req.params.id]
    )
    if (!result.rows.length) return res.status(404).json({ error: 'Usuário não encontrado' })
    res.json({ usuario: result.rows[0] })
  } catch (err) { next(err) }
}

async function resetarSenha(req, res, next) {
  try {
    const { senha } = req.body
    if (!senha) return res.status(400).json({ error: 'Senha é obrigatória' })
    const senhaHash = await bcrypt.hash(senha, 10)
    const result = await db.query(
      'UPDATE usuarios SET senha = $1 WHERE id = $2 RETURNING id',
      [senhaHash, req.params.id]
    )
    if (!result.rows.length) return res.status(404).json({ error: 'Usuário não encontrado' })
    res.json({ message: 'Senha redefinida' })
  } catch (err) { next(err) }
}

async function remover(req, res, next) {
  try {
    if (Number(req.params.id) === req.usuario.id) {
      return res.status(400).json({ error: 'Não é possível remover o próprio usuário' })
    }
    const result = await db.query('DELETE FROM usuarios WHERE id = $1 RETURNING id', [req.params.id])
    if (!result.rows.length) return res.status(404).json({ error: 'Usuário não encontrado' })
    res.json({ message: 'Usuário removido' })
  } catch (err) { next(err) }
}

module.exports = { listar, criar, atualizar, resetarSenha, remover }
