const db = require('../config/database')
const PDFDocument = require('pdfkit')
const ExcelJS = require('exceljs')
const { Parser } = require('json2csv')

async function exportarPDF(req, res, next) {
  try {
    const { pesquisa_id } = req.params
    const pesquisa = await db.query('SELECT * FROM pesquisas WHERE id = $1', [pesquisa_id])
    if (!pesquisa.rows.length) return res.status(404).json({ error: 'Pesquisa não encontrada' })

    const perguntas = await db.query('SELECT * FROM perguntas WHERE pesquisa_id = $1 ORDER BY ordenacao', [pesquisa_id])
    const respostas = await db.query(
      `SELECT r.*, p.titulo AS pergunta_titulo, p.tipo AS pergunta_tipo
       FROM respostas r JOIN perguntas p ON p.id = r.pergunta_id
       WHERE r.pesquisa_id = $1 ORDER BY r.created_at`, [pesquisa_id]
    )

    const doc = new PDFDocument({ margin: 30 })
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename=pesquisa_${pesquisa_id}.pdf`)
    doc.pipe(res)

    doc.fontSize(20).text(pesquisa.rows[0].titulo, { align: 'center' })
    doc.moveDown()
    doc.fontSize(10).text(`Período: ${pesquisa.rows[0].data_inicio || 'N/A'} a ${pesquisa.rows[0].data_fim || 'N/A'}`)
    doc.text(`Margem de erro: ${pesquisa.rows[0].margem_erro || 'N/A'}% | Nível de confiança: ${pesquisa.rows[0].nivel_confianca || 'N/A'}%`)
    doc.moveDown()

    for (const pergunta of perguntas.rows) {
      if (doc.y > 700) { doc.addPage() }
      doc.fontSize(12).text(pergunta.titulo, { underline: true })
      doc.moveDown(0.5)

      const respostasPergunta = respostas.rows.filter((r) => r.pergunta_id === pergunta.id)
      if (pergunta.tipo === 'unica_escolha' || pergunta.tipo === 'multipla_escolha' || pergunta.tipo === 'likert') {
        const contagem = {}
        respostasPergunta.forEach((r) => {
          const val = r.resposta?.valor
          contagem[val] = (contagem[val] || 0) + 1
        })
        for (const [valor, qtd] of Object.entries(contagem)) {
          doc.fontSize(10).text(`  ${valor}: ${qtd} (${((qtd / respostasPergunta.length) * 100).toFixed(1)}%)`)
        }
      } else {
        respostasPergunta.forEach((r) => {
          doc.fontSize(10).text(`  ${r.resposta?.valor || '-'}`)
        })
      }
      doc.moveDown()
    }

    doc.end()
  } catch (err) { next(err) }
}

async function exportarExcel(req, res, next) {
  try {
    const { pesquisa_id } = req.params
    const workbook = new ExcelJS.Workbook()
    const sheet = workbook.addWorksheet('Respostas')

    const perguntas = await db.query('SELECT * FROM perguntas WHERE pesquisa_id = $1 ORDER BY ordenacao', [pesquisa_id])
    const respostas = await db.query(
      `SELECT r.*, e.nome AS entrevistado_nome, e.cidade, e.estado, e.idade, e.genero
       FROM respostas r
       JOIN entrevistados e ON e.id = r.entrevistado_id
       WHERE r.pesquisa_id = $1 ORDER BY r.entrevistado_id, r.pergunta_id`, [pesquisa_id]
    )

    const headers = ['Entrevistado', 'Cidade', 'Estado', 'Idade', 'Gênero']
    perguntas.rows.forEach((p) => headers.push(p.titulo))
    sheet.addRow(headers)

    const rows = {}
    for (const r of respostas.rows) {
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

    for (const row of Object.values(rows)) {
      const data = [row.nome, row.cidade, row.estado, row.idade, row.genero]
      perguntas.rows.forEach((p) => data.push(row.respostas[p.id] || ''))
      sheet.addRow(data)
    }

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    res.setHeader('Content-Disposition', `attachment; filename=pesquisa_${pesquisa_id}.xlsx`)
    await workbook.xlsx.write(res)
    res.end()
  } catch (err) { next(err) }
}

async function exportarCSV(req, res, next) {
  try {
    const { pesquisa_id } = req.params
    const perguntas = await db.query('SELECT * FROM perguntas WHERE pesquisa_id = $1 ORDER BY ordenacao', [pesquisa_id])
    const respostas = await db.query(
      `SELECT r.*, e.nome AS entrevistado_nome, e.cidade, e.estado, e.idade, e.genero
       FROM respostas r
       JOIN entrevistados e ON e.id = r.entrevistado_id
       WHERE r.pesquisa_id = $1 ORDER BY r.entrevistado_id, r.pergunta_id`, [pesquisa_id]
    )

    const rows = {}
    for (const r of respostas.rows) {
      if (!rows[r.entrevistado_id]) {
        rows[r.entrevistado_id] = {
          Entrevistado: r.entrevistado_nome,
          Cidade: r.cidade,
          Estado: r.estado,
          Idade: r.idade,
          Genero: r.genero,
        }
      }
      rows[r.entrevistado_id][r.pergunta_id] = r.resposta?.valor
    }

    const fields = ['Entrevistado', 'Cidade', 'Estado', 'Idade', 'Genero']
    perguntas.rows.forEach((p) => fields.push(p.titulo))

    for (const row of Object.values(rows)) {
      perguntas.rows.forEach((p) => {
        row[p.titulo] = row[p.id]
        delete row[p.id]
      })
    }

    const parser = new Parser({ fields })
    const csv = parser.parse(Object.values(rows))

    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', `attachment; filename=pesquisa_${pesquisa_id}.csv`)
    res.send(csv)
  } catch (err) { next(err) }
}

async function exportarJSON(req, res, next) {
  try {
    const { pesquisa_id } = req.params
    const pesquisa = await db.query('SELECT * FROM pesquisas WHERE id = $1', [pesquisa_id])
    const perguntas = await db.query('SELECT * FROM perguntas WHERE pesquisa_id = $1 ORDER BY ordenacao', [pesquisa_id])
    const respostas = await db.query(
      `SELECT r.*, e.nome AS entrevistado_nome, e.cidade, e.estado, e.idade, e.genero
       FROM respostas r
       JOIN entrevistados e ON e.id = r.entrevistado_id
       WHERE r.pesquisa_id = $1 ORDER BY r.entrevistado_id`, [pesquisa_id]
    )

    res.json({
      pesquisa: pesquisa.rows[0],
      perguntas: perguntas.rows,
      respostas: respostas.rows,
    })
  } catch (err) { next(err) }
}

module.exports = { exportarPDF, exportarExcel, exportarCSV, exportarJSON }
