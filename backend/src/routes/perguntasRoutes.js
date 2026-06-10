const { Router } = require('express')
const { listar, obter, criar, atualizar, remover, reordenar } = require('../controllers/perguntasController')
const { authenticate } = require('../middleware/auth')

const router = Router()

router.get('/', authenticate, listar)
router.get('/:id', authenticate, obter)
router.post('/', authenticate, criar)
router.put('/:id', authenticate, atualizar)
router.put('/reordenar/lista', authenticate, reordenar)
router.delete('/:id', authenticate, remover)

module.exports = router
