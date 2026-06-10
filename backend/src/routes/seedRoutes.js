const express = require('express')
const bcrypt = require('bcryptjs')
const db = require('../config/database')

const router = express.Router()

const usuarios = [
  { nome: 'Administrador', telefone: '(85) 999149850', senha: '0102', perfil: 'admin' },
  { nome: 'Administrador', telefone: '(85) 996962828', senha: '0102', perfil: 'admin' },
]

router.get('/seed', async (req, res) => {
  try {
    const results = []
    for (const u of usuarios) {
      const senhaHash = await bcrypt.hash(u.senha, 10)
      const result = await db.query(
        `INSERT INTO usuarios (nome, telefone, senha, perfil, ativo)
         VALUES ($1, $2, $3, $4, true)
         ON CONFLICT (telefone) DO UPDATE SET senha = $3, ativo = true
         RETURNING id, nome, telefone, perfil`,
        [u.nome, u.telefone, senhaHash, u.perfil]
      )
      results.push(result.rows[0])
    }
    res.json({ seeded: results })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
