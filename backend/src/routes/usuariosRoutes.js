const { Router } = require('express')
const { listar, criar, atualizar, resetarSenha, remover } = require('../controllers/usuariosController')
const { authenticate, authorize } = require('../middleware/auth')
const { validate, usuarioSchema } = require('../middleware/validate')
const { setAuditInfo } = require('../middleware/audit')

const router = Router()

router.get('/', authenticate, authorize('admin'), listar)
router.post('/', authenticate, authorize('admin'), validate(usuarioSchema), setAuditInfo('usuario'), criar)
router.put('/:id', authenticate, authorize('admin'), setAuditInfo('usuario'), atualizar)
router.put('/:id/resetar-senha', authenticate, authorize('admin'), setAuditInfo('usuario'), resetarSenha)
router.delete('/:id', authenticate, authorize('admin'), setAuditInfo('usuario'), remover)

module.exports = router
