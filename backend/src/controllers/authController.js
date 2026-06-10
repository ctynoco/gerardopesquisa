const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const db = require('../config/database')

async function register(req, res, next) {
  try {
    const { nome, email, senha, perfil } = req.body

    if (!nome || !email || !senha) {
      return res.status(400).json({ error: 'Nome, email e senha são obrigatórios' })
    }

    const existente = await db.query('SELECT id FROM usuarios WHERE email = $1', [email])
    if (existente.rows.length) {
      return res.status(409).json({ error: 'Email já cadastrado' })
    }

    const senhaHash = await bcrypt.hash(senha, 10)
    const result = await db.query(
      `INSERT INTO usuarios (nome, email, senha, perfil) VALUES ($1, $2, $3, $4) RETURNING id, nome, email, perfil, created_at`,
      [nome, email, senhaHash, perfil || 'entrevistador']
    )

    res.status(201).json({ usuario: result.rows[0] })
  } catch (err) {
    next(err)
  }
}

async function login(req, res, next) {
  try {
    const { email, senha } = req.body

    if (!email || !senha) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' })
    }

    const result = await db.query('SELECT * FROM usuarios WHERE email = $1', [email])
    const usuario = result.rows[0]

    if (!usuario) {
      return res.status(401).json({ error: 'Credenciais inválidas' })
    }

    if (!usuario.ativo) {
      return res.status(401).json({ error: 'Usuário inativo' })
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senha)
    if (!senhaValida) {
      return res.status(401).json({ error: 'Credenciais inválidas' })
    }

    const token = jwt.sign(
      { id: usuario.id, perfil: usuario.perfil },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    )

    res.json({
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        perfil: usuario.perfil,
      },
    })
  } catch (err) {
    next(err)
  }
}

async function perfil(req, res, next) {
  try {
    const result = await db.query(
      'SELECT id, nome, email, perfil, ativo, created_at FROM usuarios WHERE id = $1',
      [req.usuario.id]
    )

    if (!result.rows.length) {
      return res.status(404).json({ error: 'Usuário não encontrado' })
    }

    res.json({ usuario: result.rows[0] })
  } catch (err) {
    next(err)
  }
}

module.exports = { register, login, perfil }
