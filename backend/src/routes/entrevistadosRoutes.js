const { Router } = require('express')
const { listar, obter, criar, atualizar, remover } = require('../controllers/entrevistadosController')
const { authenticate } = require('../middleware/auth')

const router = Router()

router.get('/', authenticate, listar)
router.get('/:id', authenticate, obter)
router.post('/', authenticate, criar)
router.put('/:id', authenticate, atualizar)
router.delete('/:id', authenticate, remover)

module.exports = router
