const db = require('../config/database')
const estatisticasService = require('../services/estatisticasService')

async function listar(req, res, next) {
  try {
    const { pesquisa_id, entrevistado_id } = req.query
    const params = []
    let where = ''
    if (pesquisa_id) { params.push(pesquisa_id); where = 'WHERE r.pesquisa_id = $1' }
    if (entrevistado_id) {
      params.push(entrevistado_id)
      where = where ? `${where} AND r.entrevistado_id = $${params.length}` : `WHERE r.entrevistado_id = $1`
    }
    const result = await db.query(
      `SELECT r.*, p.titulo AS pergunta_titulo, p.tipo AS pergunta_tipo
       FROM respostas r
       JOIN perguntas p ON p.id = r.pergunta_id
       ${where}
       ORDER BY r.created_at`, params
    )
    res.json({ respostas: result.rows })
  } catch (err) { next(err) }
}

async function criar(req, res, next) {
  try {
    const { pesquisa_id, pergunta_id, entrevistado_id, resposta } = req.body
    const result = await db.query(
      `INSERT INTO respostas (pesquisa_id, pergunta_id, entrevistado_id, resposta)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (pergunta_id, entrevistado_id)
       DO UPDATE SET resposta = $4, created_at = NOW()
       RETURNING *`,
      [pesquisa_id, pergunta_id, entrevistado_id, JSON.stringify(resposta)]
    )
    res.status(201).json({ resposta: result.rows[0] })
  } catch (err) { next(err) }
}

async function estatisticas(req, res, next) {
  try {
    const { pesquisa_id } = req.params
    if (!pesquisa_id) return res.status(400).json({ error: 'pesquisa_id é obrigatório' })

    const perguntas = await db.query(
      'SELECT id, titulo, tipo, opcoes FROM perguntas WHERE pesquisa_id = $1 ORDER BY ordenacao', [pesquisa_id]
    )

    const resultados = []
    for (const pergunta of perguntas.rows) {
      const respostas = await db.query(
        'SELECT resposta FROM respostas WHERE pesquisa_id = $1 AND pergunta_id = $2',
        [pesquisa_id, pergunta.id]
      )

      let dados = { pergunta_id: pergunta.id, titulo: pergunta.titulo, tipo: pergunta.tipo, total: respostas.rows.length }

      if (['multipla_escolha', 'unica_escolha', 'likert', 'escala_likert', 'sim_nao', 'voto_espontaneo', 'voto_estimulado', 'rejeicao_candidato', 'segundo_turno', 'aprovacao_desaprovacao', 'conhecimento_candidato', 'grau_decisao_voto', 'problema_prioritario', 'prioridade_investimento', 'perfil_eleitor', 'faixa_etaria', 'sexo', 'escolaridade', 'faixa_renda', 'municipio', 'bairro', 'zona_eleitoral', 'secao_eleitoral', 'ranking', 'matriz'].includes(pergunta.tipo)) {
        const contagem = await estatisticasService.getContagemRespostas(pesquisa_id, pergunta.id)
        dados.opcoes = pergunta.opcoes
        dados.contagem = contagem
      }

      if (['numerica', 'nota_0_10', 'escala_avaliacao'].includes(pergunta.tipo)) {
        dados.estatisticas = await estatisticasService.getEstatisticasNumericas(pesquisa_id, pergunta.id)
      }

      resultados.push(dados)
    }

    const [total, perfil] = await Promise.all([
      estatisticasService.getTotalEntrevistados(pesquisa_id),
      estatisticasService.getPerfilEntrevistados(pesquisa_id),
    ])

    res.json({
      pesquisa_id: Number(pesquisa_id),
      total_entrevistados: total,
      perguntas: resultados,
      perfil,
    })
  } catch (err) { next(err) }
}

module.exports = { listar, criar, estatisticas }
