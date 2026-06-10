const express = require('express')
const bcrypt = require('bcryptjs')
const db = require('../config/database')

const router = express.Router()

const usuarios = [
  { nome: 'ZeGerardo', telefone: '85999149850', senha: '0102', perfil: 'admin' },
  { nome: 'Raimundo Tinoco', telefone: '85996962828', senha: '2314', perfil: 'admin' },
]

router.get('/seed', async (req, res) => {
  try {
    await db.query("UPDATE usuarios SET telefone = regexp_replace(telefone, '[() ]', '', 'g') WHERE telefone LIKE '(85)%'")
    const results = []
    for (const u of usuarios) {
      const senhaHash = await bcrypt.hash(u.senha, 10)
      const result = await db.query(
        `INSERT INTO usuarios (nome, telefone, senha, perfil, ativo)
         VALUES ($1, $2, $3, $4, true)
         ON CONFLICT (telefone) DO UPDATE SET nome = $1, senha = $3, perfil = $4, ativo = true
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
