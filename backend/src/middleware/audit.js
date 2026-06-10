const db = require('../config/database')

async function auditLog(req, res, next) {
  const originalJson = res.json.bind(res)

  res.json = function (body) {
    if (req.metodoAuditavel && res.statusCode < 400) {
      const entidade = req.entidadeAuditavel
      if (entidade) {
        const log = {
          usuario_id: req.usuario?.id,
          acao: `${req.method} ${req.originalUrl}`,
          entidade: entidade.nome,
          entidade_id: entidade.id || body?.id || req.params?.id,
          dados_antigos: entidade.dadosAntigos || null,
          dados_novos: req.method !== 'GET' && req.method !== 'DELETE' ? req.body : null,
          ip: req.ip || req.connection?.remoteAddress,
        }

        db.query(
          `INSERT INTO auditoria (usuario_id, acao, entidade, entidade_id, dados_antigos, dados_novos, ip)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [log.usuario_id, log.acao, log.entidade, log.entidade_id, log.dados_antigos, log.dados_novos, log.ip]
        ).catch((err) => console.error('Audit log error:', err))
      }
    }

    return originalJson(body)
  }

  next()
}

function setAuditInfo(nome, id, dadosAntigos) {
  return (req, res, next) => {
    req.metodoAuditavel = true
    req.entidadeAuditavel = { nome, id, dadosAntigos }
    next()
  }
}

module.exports = { auditLog, setAuditInfo }
