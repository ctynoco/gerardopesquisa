const db = require('../config/database')
const PDFDocument = require('pdfkit')
const ExcelJS = require('exceljs')
const { Parser } = require('json2csv')

async function getPesquisa(pesquisa_id) {
  const result = await db.query('SELECT * FROM pesquisas WHERE id = $1', [pesquisa_id])
  if (!result.rows.length) return null
  return result.rows[0]
}

async function getPerguntas(pesquisa_id) {
  const result = await db.query('SELECT * FROM perguntas WHERE pesquisa_id = $1 ORDER BY ordenacao', [pesquisa_id])
  return result.rows
}

async function getRespostasCompletas(pesquisa_id) {
  const result = await db.query(
    `SELECT r.*, p.titulo AS pergunta_titulo, p.tipo AS pergunta_tipo,
            e.nome AS entrevistado_nome, e.cidade, e.estado, e.idade, e.genero
     FROM respostas r
     JOIN perguntas p ON p.id = r.pergunta_id
     JOIN entrevistados e ON e.id = r.entrevistado_id
     WHERE r.pesquisa_id = $1
     ORDER BY r.entrevistado_id, r.pergunta_id`, [pesquisa_id]
  )
  return result.rows
}

function buildRespostasPorEntrevistado(respostas, perguntas) {
  const rows = {}
  for (const r of respostas) {
    if (!rows[r.entrevistado_id]) {
      rows[r.entrevistado_id] = {
        nome: r.entrevistado_nome,
        cidade: r.cidade,
        estado: r.estado,
        idade: r.idade,
        genero: r.genero,
        respostas: {},
      }
    }
    rows[r.entrevistado_id].respostas[r.pergunta_id] = r.resposta?.valor
  }
  return rows
}

function getRespostasPorPergunta(respostas) {
  const map = {}
  for (const r of respostas) {
    if (!map[r.pergunta_id]) map[r.pergunta_id] = []
    map[r.pergunta_id].push(r)
  }
  return map
}

module.exports = {
  getPesquisa,
  getPerguntas,
  getRespostasCompletas,
  buildRespostasPorEntrevistado,
  getRespostasPorPergunta,
}
