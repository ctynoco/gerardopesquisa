const { Router } = require('express')
const { listar, obter, criar, atualizar, remover } = require('../controllers/pesquisasController')
const { authenticate } = require('../middleware/auth')
const { validate, pesquisaSchema } = require('../middleware/validate')
const { setAuditInfo } = require('../middleware/audit')

const router = Router()

router.get('/', authenticate, listar)
router.get('/:id', authenticate, obter)
router.post('/', authenticate, validate(pesquisaSchema), setAuditInfo('pesquisa'), criar)
router.put('/:id', authenticate, validate(pesquisaSchema), setAuditInfo('pesquisa', null, null), atualizar)
router.delete('/:id', authenticate, setAuditInfo('pesquisa'), remover)

module.exports = router
