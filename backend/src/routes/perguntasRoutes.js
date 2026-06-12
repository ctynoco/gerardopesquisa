const { Router } = require('express')
const { listar, obter, criar, atualizar, remover, reordenar } = require('../controllers/perguntasController')
const { authenticate } = require('../middleware/auth')
const { validate, perguntaSchema } = require('../middleware/validate')
const { setAuditInfo } = require('../middleware/audit')

const router = Router()

router.get('/', authenticate, listar)
router.get('/:id', authenticate, obter)
router.post('/', authenticate, validate(perguntaSchema), setAuditInfo('pergunta'), criar)
router.put('/:id', authenticate, validate(perguntaSchema), setAuditInfo('pergunta'), atualizar)
router.put('/reordenar/lista', authenticate, setAuditInfo('pergunta'), reordenar)
router.delete('/:id', authenticate, setAuditInfo('pergunta'), remover)

module.exports = router
