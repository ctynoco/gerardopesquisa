const PDFDocument = require('pdfkit')
const ExcelJS = require('exceljs')
const { Parser } = require('json2csv')
const exportacaoService = require('../services/exportacaoService')

const COR_PRIMARY = '#1d4ed8'
const COR_SECONDARY = '#64748b'
const COR_BG = '#f8fafc'
const COR_BAR = '#1d4ed8'

function drawBarChart(doc, contagem, total, x, y, w, labelW) {
  const entries = Object.entries(contagem).sort((a, b) => b[1] - a[1])
  const barH = 14
  const gap = 4
  const chartH = entries.length * (barH + gap)
  const maxQtd = Math.max(...entries.map(([, q]) => q), 1)

  entries.forEach(([valor, qtd], i) => {
    const by = y + i * (barH + gap)
    const pct = ((qtd / total) * 100).toFixed(1)
    const barW = (qtd / maxQtd) * w

    doc.fontSize(7).fillColor('#333')
      .text(`${valor}`, x, by, { width: labelW, lineBreak: false })

    doc.fillColor(COR_BAR)
      .roundedRect(x + labelW + 4, by, Math.max(barW, 2), barH, 3)
      .fill()

    doc.fontSize(7).fillColor('#555')
      .text(`${qtd} (${pct}%)`, x + labelW + 4 + barW + 4, by + 2, { width: 80, lineBreak: false })
  })
  return y + chartH
}

async function exportarPDF(req, res, next) {
  try {
    const { pesquisa_id } = req.params
    const pesquisa = await exportacaoService.getPesquisa(pesquisa_id)
    if (!pesquisa) return res.status(404).json({ error: 'Pesquisa não encontrada' })

    const perguntas = await exportacaoService.getPerguntas(pesquisa_id)
    const respostas = await exportacaoService.getRespostasCompletas(pesquisa_id)
    const totalEntrevistados = new Set(respostas.map((r) => r.entrevistado_id)).size

    const doc = new PDFDocument({ margin: 40, size: 'A4' })
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename=pesquisa_${pesquisa_id}.pdf`)
    doc.pipe(res)

    // Cover
    doc.rect(0, 0, doc.page.width, 140).fill(COR_PRIMARY)
    doc.fillColor('#fff').fontSize(24).font('Helvetica-Bold')
      .text(pesquisa.titulo, 40, 50, { width: doc.page.width - 80, align: 'center' })
    doc.fontSize(11).font('Helvetica')
      .text('RELATÓRIO DE PESQUISA', 40, 90, { align: 'center' })
    doc.fillColor('#cbd5e1').fontSize(9)
      .text(`Período: ${pesquisa.data_inicio || 'N/A'} a ${pesquisa.data_fim || 'N/A'}`, 40, 115, { align: 'center' })

    doc.fillColor('#333').fontSize(9)
    let y = 165
    const info = [
      ['Margem de erro', `${pesquisa.margem_erro || 'N/A'}%`],
      ['Nível de confiança', `${pesquisa.nivel_confianca || 'N/A'}%`],
      ['Tamanho da amostra', `${pesquisa.tamanho_amostra || 'N/A'}`],
      ['População alvo', `${pesquisa.populacao_alvo || 'N/A'}`],
      ['Total de entrevistados', `${totalEntrevistados}`],
    ]
    info.forEach(([k, v], i) => {
      const ix = i % 2 === 0 ? 40 : doc.page.width / 2 + 20
      const iy = y + Math.floor(i / 2) * 20
      doc.fillColor(COR_SECONDARY).text(k + ':', ix, iy, { width: 120 })
      doc.fillColor('#333').font('Helvetica-Bold').text(v, ix + 120, iy)
      doc.font('Helvetica')
    })

    y += Math.ceil(info.length / 2) * 20 + 20

    const respostasPorPergunta = exportacaoService.getRespostasPorPergunta(respostas)
    // Per-page index
    const indiceRespostas = { rows: [] }
    let perguntaIdx = 0

    for (const pergunta of perguntas) {
      perguntaIdx++
      if (y > 620) { doc.addPage(); y = 40 }

      doc.fillColor(COR_PRIMARY).fontSize(11).font('Helvetica-Bold')
        .text(`Q${perguntaIdx}. ${pergunta.titulo}`, 40, y)
      y += 16

      const rp = respostasPorPergunta[pergunta.id] || []
      doc.fontSize(8).fillColor(COR_SECONDARY)
        .text(`${rp.length} respostas`, 40, y)
      y += 16

      if (['unica_escolha', 'multipla_escolha', 'likert', 'escala_likert', 'sim_nao', 'voto_espontaneo', 'voto_estimulado', 'rejeicao_candidato', 'segundo_turno', 'aprovacao_desaprovacao', 'conhecimento_candidato', 'grau_decisao_voto', 'problema_prioritario', 'prioridade_investimento', 'perfil_eleitor', 'faixa_etaria', 'sexo', 'escolaridade', 'faixa_renda', 'municipio', 'bairro', 'zona_eleitoral', 'secao_eleitoral', 'ranking', 'matriz', 'nota_0_10', 'escala_avaliacao', 'numerica'].includes(pergunta.tipo) && rp.length > 0) {
        const contagem = {}
        rp.forEach((r) => {
          if (Array.isArray(r.resposta?.valor)) {
            r.resposta.valor.forEach((v) => { contagem[v] = (contagem[v] || 0) + 1 })
          } else {
            const val = r.resposta?.valor
            contagem[val] = (contagem[val] || 0) + 1
          }
        })

        const chartH = Object.keys(contagem).length * 19
        if (y + chartH > 620) { doc.addPage(); y = 40 }

        doc.roundedRect(45, y, doc.page.width - 90, chartH + 8, 4).fillColor('#f1f5f9').fill()
        drawBarChart(doc, contagem, rp.length, 50, y + 4, doc.page.width - 180, 110)
        y += chartH + 16
      } else if (rp.length > 0) {
        doc.fontSize(8).fillColor('#555')
        rp.slice(0, 10).forEach((r) => {
          if (y > 700) { doc.addPage(); y = 40 }
          doc.text(`  ${r.resposta?.valor || '-'}`, 50, y, { width: doc.page.width - 100 })
          y += 12
        })
        if (rp.length > 10) {
          doc.text(`  ... e mais ${rp.length - 10} respostas`, 50, y)
          y += 12
        }
        y += 4
      }
      indiceRespostas.rows.push({ idx: perguntaIdx, titulo: pergunta.titulo, total: rp.length })
    }

    // Demographics section
    if (y > 520) { doc.addPage(); y = 40 }
    doc.fillColor(COR_PRIMARY).fontSize(13).font('Helvetica-Bold')
      .text('PERFIL DOS ENTREVISTADOS', 40, y, { align: 'center' })
    y += 24

    const generos = {}
    const idades = { '16-24': 0, '25-34': 0, '35-44': 0, '45-59': 0, '60+': 0 }
    const escolaridades = {}
    respostas.forEach((r) => {
      if (r.genero) generos[r.genero] = (generos[r.genero] || 0) + 1
      if (r.idade) {
        if (r.idade <= 24) idades['16-24']++
        else if (r.idade <= 34) idades['25-34']++
        else if (r.idade <= 44) idades['35-44']++
        else if (r.idade <= 59) idades['45-59']++
        else idades['60+']++
      }
      if (r.escolaridade) escolaridades[r.escolaridade] = (escolaridades[r.escolaridade] || 0) + 1
    })

    doc.fontSize(10).fillColor('#333').font('Helvetica-Bold').text('Gênero', 40, y); y += 14
    y = drawBarChart(doc, generos, Object.values(generos).reduce((s, v) => s + v, 0), 40, y, doc.page.width - 130, 130)

    doc.fontSize(10).fillColor('#333').font('Helvetica-Bold').text('Faixa Etária', 40, y + 8); y += 22
    y = drawBarChart(doc, idades, Object.values(idades).reduce((s, v) => s + v, 0), 40, y, doc.page.width - 130, 130)

    doc.fontSize(10).fillColor('#333').font('Helvetica-Bold').text('Escolaridade', 40, y + 8); y += 22
    y = drawBarChart(doc, escolaridades, Object.values(escolaridades).reduce((s, v) => s + v, 0), 40, y, doc.page.width - 130, 130)

    // Footer
    doc.fontSize(8).fillColor(COR_SECONDARY)
      .text(`Relatório gerado em ${new Date().toLocaleString('pt-BR')} | Instituto Pesquisa Eleitoral`, 40, doc.page.height - 40, { align: 'center', width: doc.page.width - 80 })

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
    const headerRow = sheet.addRow(headers)
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } }
    headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1D4ED8' } }
    headerRow.alignment = { horizontal: 'center', vertical: 'middle' }

    const rows = exportacaoService.buildRespostasPorEntrevistado(respostas, perguntas)

    for (const row of Object.values(rows)) {
      const data = [row.nome, row.cidade, row.estado, row.idade, row.genero]
      perguntas.forEach((p) => data.push(row.respostas[p.id] || ''))
      const r = sheet.addRow(data)
      r.alignment = { vertical: 'middle' }
    }

    sheet.columns.forEach((col) => { col.width = 20 })
    sheet.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: headers.length } }

    // Summary sheet
    const sumSheet = workbook.addWorksheet('Resumo')
    sumSheet.addRow(['Pergunta', 'Tipo', 'Total Respostas']).font = { bold: true, color: { argb: 'FFFFFFFF' } }
    sumSheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1D4ED8' } }

    const respostasPorPergunta = exportacaoService.getRespostasPorPergunta(respostas)
    for (const p of perguntas) {
      sumSheet.addRow([p.titulo, p.tipo, (respostasPorPergunta[p.id] || []).length])
    }
    sumSheet.columns.forEach((col) => { col.width = 25 })

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