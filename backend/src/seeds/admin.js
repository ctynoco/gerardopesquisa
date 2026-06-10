const bcrypt = require('bcryptjs')
const db = require('../config/database')

async function seed() {
  const senhaHash = await bcrypt.hash('2314@#', 10)
  const result = await db.query(
    `INSERT INTO usuarios (nome, telefone, senha, perfil, ativo)
     VALUES ($1, $2, $3, $4, true)
     ON CONFLICT (telefone) DO UPDATE SET senha = $3, perfil = $4, ativo = true
     RETURNING id, nome, telefone, perfil`,
    ['Administrador', '(85) 996962828', senhaHash, 'admin']
  )
  console.log('Admin user created:', result.rows[0])
  process.exit(0)
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
