const PDFDocument = require('pdfkit')
const ExcelJS = require('exceljs')
const { Parser } = require('json2csv')
const exportacaoService = require('../services/exportacaoService')

async function exportarPDF(req, res, next) {
  try {
    const { pesquisa_id } = req.params
    const pesquisa = await exportacaoService.getPesquisa(pesquisa_id)
    if (!pesquisa) return res.status(404).json({ error: 'Pesquisa não encontrada' })

    const perguntas = await exportacaoService.getPerguntas(pesquisa_id)
    const respostas = await exportacaoService.getRespostasCompletas(pesquisa_id)

    const doc = new PDFDocument({ margin: 30 })
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename=pesquisa_${pesquisa_id}.pdf`)
    doc.pipe(res)

    doc.fontSize(20).text(pesquisa.titulo, { align: 'center' })
    doc.moveDown()
    doc.fontSize(10).text(`Período: ${pesquisa.data_inicio || 'N/A'} a ${pesquisa.data_fim || 'N/A'}`)
    doc.text(`Margem de erro: ${pesquisa.margem_erro || 'N/A'}% | Nível de confiança: ${pesquisa.nivel_confianca || 'N/A'}%`)
    doc.moveDown()

    const respostasPorPergunta = exportacaoService.getRespostasPorPergunta(respostas)
    for (const pergunta of perguntas) {
      if (doc.y > 700) { doc.addPage() }
      doc.fontSize(12).text(pergunta.titulo, { underline: true })
      doc.moveDown(0.5)

      const respostasPergunta = respostasPorPergunta[pergunta.id] || []
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

    const perguntas = await exportacaoService.getPerguntas(pesquisa_id)
    const respostas = await exportacaoService.getRespostasCompletas(pesquisa_id)

    const headers = ['Entrevistado', 'Cidade', 'Estado', 'Idade', 'Gênero']
    perguntas.forEach((p) => headers.push(p.titulo))
    sheet.addRow(headers)

    const rows = exportacaoService.buildRespostasPorEntrevistado(respostas, perguntas)

    for (const row of Object.values(rows)) {
      const data = [row.nome, row.cidade, row.estado, row.idade, row.genero]
      perguntas.forEach((p) => data.push(row.respostas[p.id] || ''))
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
    const perguntas = await exportacaoService.getPerguntas(pesquisa_id)
    const respostas = await exportacaoService.getRespostasCompletas(pesquisa_id)

    const rows = {}
    for (const r of respostas) {
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
    perguntas.forEach((p) => fields.push(p.titulo))

    for (const row of Object.values(rows)) {
      perguntas.forEach((p) => {
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
    const pesquisa = await exportacaoService.getPesquisa(pesquisa_id)
    if (!pesquisa) return res.status(404).json({ error: 'Pesquisa não encontrada' })
    const perguntas = await exportacaoService.getPerguntas(pesquisa_id)
    const respostas = await exportacaoService.getRespostasCompletas(pesquisa_id)

    res.json({ pesquisa, perguntas, respostas })
  } catch (err) { next(err) }
}

module.exports = { exportarPDF, exportarExcel, exportarCSV, exportarJSON }
