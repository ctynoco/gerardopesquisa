const db = require('../config/database')

async function producaoEntrevistadores(req, res, next) {
  try {
    const { pesquisa_id } = req.params

    const [totalPerguntasRes, entrevistadoresRes] = await Promise.all([
      db.query('SELECT COUNT(*)::int AS total FROM perguntas WHERE pesquisa_id = $1', [pesquisa_id]),
      db.query(`
        WITH completude AS (
          SELECT e.entrevistador_id, e.id AS eid,
            COUNT(r.id)::int AS resp_count,
            SUM(COALESCE(r.tempo_seg, 0))::int AS soma_tempo
          FROM entrevistados e
          LEFT JOIN respostas r ON r.entrevistado_id = e.id
          WHERE e.pesquisa_id = $1
          GROUP BY e.id, e.entrevistador_id
        )
        SELECT
          u.id, u.nome,
          COUNT(c.eid)::int AS total_entrevistados,
          COUNT(c.eid) FILTER (WHERE c.resp_count > 0)::int AS com_respostas,
          COUNT(c.eid) FILTER (WHERE c.resp_count >= (SELECT COUNT(*) FROM perguntas WHERE pesquisa_id = $1))::int AS concluidas,
          COALESCE(SUM(c.soma_tempo), 0)::int AS soma_tempo_total,
          MAX((SELECT MAX(created_at) FROM entrevistados WHERE id = c.eid)) AS ultima_atividade
        FROM usuarios u
        JOIN completude c ON c.entrevistador_id = u.id
        WHERE u.perfil = 'entrevistador'
        GROUP BY u.id, u.nome
        ORDER BY COUNT(c.eid) DESC
      `, [pesquisa_id]),
    ])

    const agora = new Date()

    const ranking = entrevistadoresRes.rows.map((e) => {
      const em_andamento_ent = e.com_respostas - e.concluidas
      const tempoMedioSeg = e.com_respostas > 0 ? Math.round(e.soma_tempo_total / e.com_respostas) : 0
      const minutos = Math.floor(tempoMedioSeg / 60)
      const segundos = tempoMedioSeg % 60
      const tempoMedioStr = `${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`
      const online = e.ultima_atividade && (agora - new Date(e.ultima_atividade)) < 600000

      return {
        id: e.id,
        nome: e.nome,
        total: e.total_entrevistados,
        concluidas: e.concluidas,
        em_andamento: em_andamento_ent,
        tempo_medio: tempoMedioStr,
        online,
      }
    })

    const total_coletado = ranking.reduce((s, e) => s + e.total, 0)
    const hoje = (await db.query(
      `SELECT COUNT(*)::int AS hoje FROM entrevistados WHERE pesquisa_id = $1 AND created_at::date = CURRENT_DATE`,
      [pesquisa_id]
    )).rows[0].hoje
    const total_finalizadas = ranking.reduce((s, e) => s + e.concluidas, 0)
    const total_andamento = total_coletado - total_finalizadas

    const temposValidos = ranking.filter((e) => e.tempo_medio !== '00:00')
    const tempoMedioGeral = temposValidos.length > 0
      ? temposValidos.reduce((s, e) => {
          const [m, seg] = e.tempo_medio.split(':').map(Number)
          return s + m * 60 + seg
        }, 0) / temposValidos.length
      : 0
    const mm = Math.floor(tempoMedioGeral / 60)
    const ss = Math.round(tempoMedioGeral % 60)
    const tempoMedioGeralStr = `${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`

    res.json({
      total_coletado,
      hoje,
      em_andamento: total_andamento,
      finalizadas: total_finalizadas,
      tempo_medio: tempoMedioGeralStr,
      ranking,
    })
  } catch (err) { next(err) }
}

async function painelSupervisao(req, res, next) {
  try {
    const { pesquisa_id } = req.params
    const periodo = parseInt(req.query.minutos) || 15

    const [totalRes, ultimasRes, ativosRes, hojeRes, entrevistadoresRes] = await Promise.all([
      db.query('SELECT COUNT(*)::int AS total FROM entrevistados WHERE pesquisa_id = $1', [pesquisa_id]),
      db.query(
        `SELECT e.id, e.nome, e.bairro, e.cidade, e.created_at,
                u.nome AS entrevistador
         FROM entrevistados e
         LEFT JOIN usuarios u ON u.id = e.entrevistador_id
         WHERE e.pesquisa_id = $1
         ORDER BY e.created_at DESC LIMIT 20`, [pesquisa_id]
      ),
      db.query(
        `SELECT COALESCE(COUNT(DISTINCT e.entrevistador_id), 0)::int AS ativos
         FROM entrevistados e
         WHERE e.pesquisa_id = $1
           AND e.created_at > NOW() - ($2 || ' minutes')::interval`,
        [pesquisa_id, String(periodo)]
      ),
      db.query(
        `SELECT COUNT(*)::int AS hoje
         FROM entrevistados e
         WHERE e.pesquisa_id = $1
           AND e.created_at::date = CURRENT_DATE`, [pesquisa_id]
      ),
      db.query(
        `SELECT u.id, u.nome, COUNT(e.id)::int AS total,
                MAX(e.created_at) AS ultima_atividade
         FROM usuarios u
         LEFT JOIN entrevistados e ON e.entrevistador_id = u.id AND e.pesquisa_id = $1
         WHERE u.perfil = 'entrevistador'
         GROUP BY u.id, u.nome
         ORDER BY total DESC`, [pesquisa_id]
      ),
    ])

    res.json({
      total: totalRes.rows[0].total,
      ultimas: ultimasRes.rows,
      ativos: ativosRes.rows[0].ativos,
      hoje: hojeRes.rows[0].hoje,
      entrevistadores: entrevistadoresRes.rows,
    })
  } catch (err) { next(err) }
}

module.exports = { painelSupervisao, producaoEntrevistadores }
