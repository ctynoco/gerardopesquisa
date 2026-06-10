const db = require('../config/database')

async function distribuicao(req, res, next) {
  try {
    const { pesquisa_id } = req.params
    const estados = await db.query(
      `SELECT e.estado, COUNT(*) AS quantidade
       FROM entrevistados e
       WHERE e.pesquisa_id = $1 AND e.estado IS NOT NULL
       GROUP BY e.estado ORDER BY quantidade DESC`, [pesquisa_id]
    )
    const cidades = await db.query(
      `SELECT e.cidade, e.estado, COUNT(*) AS quantidade
       FROM entrevistados e
       WHERE e.pesquisa_id = $1 AND e.cidade IS NOT NULL
       GROUP BY e.cidade, e.estado ORDER BY quantidade DESC`, [pesquisa_id]
    )
    res.json({ estados: estados.rows, cidades: cidades.rows })
  } catch (err) { next(err) }
}

async function bairrosComCoordenadas(req, res, next) {
  try {
    const { pesquisa_id } = req.params
    const result = await db.query(
      `SELECT
         COALESCE(bc.bairro, e.bairro) AS bairro,
         COUNT(*) AS quantidade,
         bc.latitude,
         bc.longitude
       FROM entrevistados e
       LEFT JOIN bairros_coordenadas bc ON bc.bairro = e.bairro
       WHERE e.pesquisa_id = $1 AND e.bairro IS NOT NULL
       GROUP BY COALESCE(bc.bairro, e.bairro), bc.latitude, bc.longitude
       ORDER BY quantidade DESC`, [pesquisa_id]
    )
    res.json(result.rows)
  } catch (err) { next(err) }
}

async function atualizarCoordenadas(req, res, next) {
  try {
    const { bairro, cidade, estado, latitude, longitude } = req.body
    await db.query(
      `INSERT INTO bairros_coordenadas (bairro, cidade, estado, latitude, longitude)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (bairro, cidade, estado)
       DO UPDATE SET latitude = $4, longitude = $5`,
      [bairro, cidade || '', estado || 'CE', latitude, longitude]
    )
    res.json({ success: true })
  } catch (err) { next(err) }
}

async function mapaCompleto(req, res, next) {
  try {
    const { pesquisa_id } = req.params
    const [bairrosRes, cidadesRes] = await Promise.all([
      db.query(
        `SELECT
           COALESCE(bc.bairro, e.bairro) AS bairro,
           COUNT(*) AS quantidade,
           bc.latitude,
           bc.longitude
         FROM entrevistados e
         LEFT JOIN bairros_coordenadas bc ON bc.bairro = e.bairro
         WHERE e.pesquisa_id = $1 AND e.bairro IS NOT NULL
         GROUP BY COALESCE(bc.bairro, e.bairro), bc.latitude, bc.longitude
         ORDER BY quantidade DESC`, [pesquisa_id]
      ),
      db.query(
        `SELECT e.cidade, e.estado, COUNT(*) AS quantidade
         FROM entrevistados e
         WHERE e.pesquisa_id = $1 AND e.cidade IS NOT NULL
         GROUP BY e.cidade, e.estado ORDER BY quantidade DESC`, [pesquisa_id]
      ),
    ])
    res.json({ bairros: bairrosRes.rows, cidades: cidadesRes.rows })
  } catch (err) { next(err) }
}

module.exports = { distribuicao, bairrosComCoordenadas, atualizarCoordenadas, mapaCompleto }
