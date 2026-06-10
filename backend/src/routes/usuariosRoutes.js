const { Router } = require('express')
const { listar, criar, atualizar, resetarSenha, remover } = require('../controllers/usuariosController')
const { authenticate, authorize } = require('../middleware/auth')

const router = Router()

router.get('/', authenticate, authorize('admin'), listar)
router.post('/', authenticate, authorize('admin'), criar)
router.put('/:id', authenticate, authorize('admin'), atualizar)
router.put('/:id/resetar-senha', authenticate, authorize('admin'), resetarSenha)
router.delete('/:id', authenticate, authorize('admin'), remover)

module.exports = router
