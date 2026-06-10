const fs = require('fs')
const path = require('path')
const db = require('./database')

async function runMigrations() {
  const migrationsDir = path.resolve(__dirname, '../migrations')
  const files = fs.readdirSync(migrationsDir).sort()

  for (const file of files) {
    if (!file.endsWith('.sql')) continue
    console.log(`Running migration: ${file}`)
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8')
    await db.query(sql)
    console.log(`Migration ${file} completed`)
  }

  console.log('All migrations executed successfully')
  return true
}

if (require.main === module) {
  require('dotenv').config({ path: path.resolve(__dirname, '../../.env') })
  runMigrations()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Migration failed:', err)
      process.exit(1)
    })
}

module.exports = runMigrations
