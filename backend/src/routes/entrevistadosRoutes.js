const { Router } = require('express')
const { listar, obter, criar, atualizar, remover } = require('../controllers/entrevistadosController')
const { authenticate } = require('../middleware/auth')
const { validate, entrevistadoSchema } = require('../middleware/validate')
const { setAuditInfo } = require('../middleware/audit')

const router = Router()

router.get('/', authenticate, listar)
router.get('/:id', authenticate, obter)
router.post('/', authenticate, validate(entrevistadoSchema), setAuditInfo('entrevistado'), criar)
router.put('/:id', authenticate, setAuditInfo('entrevistado'), atualizar)
router.delete('/:id', authenticate, setAuditInfo('entrevistado'), remover)

module.exports = router
