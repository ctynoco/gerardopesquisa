const bcrypt = require('bcryptjs')
const db = require('../config/database')

const usuarios = [
  { nome: 'ZeGerardo', telefone: '(85) 999149850', senha: '0102', perfil: 'admin' },
  { nome: 'Raimundo Tinoco', telefone: '(85) 996962828', senha: '0102', perfil: 'admin' },
]

async function seed() {
  for (const u of usuarios) {
    const senhaHash = await bcrypt.hash(u.senha, 10)
    const result = await db.query(
      `INSERT INTO usuarios (nome, telefone, senha, perfil, ativo)
       VALUES ($1, $2, $3, $4, true)
       ON CONFLICT (telefone) DO UPDATE SET nome = $1, senha = $3, perfil = $4, ativo = true
       RETURNING id, nome, telefone, perfil`,
      [u.nome, u.telefone, senhaHash, u.perfil]
    )
    console.log('Usuario:', result.rows[0])
  }
  console.log('Seed concluido')
  process.exit(0)
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
