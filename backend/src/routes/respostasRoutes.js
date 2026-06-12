const { Router } = require('express')
const { listar, criar, estatisticas } = require('../controllers/respostasController')
const { authenticate } = require('../middleware/auth')
const { validate, respostaSchema } = require('../middleware/validate')
const { setAuditInfo } = require('../middleware/audit')

const router = Router()

router.get('/', authenticate, listar)
router.post('/', authenticate, validate(respostaSchema), setAuditInfo('resposta'), criar)
router.get('/estatisticas/:pesquisa_id', authenticate, estatisticas)

module.exports = router
