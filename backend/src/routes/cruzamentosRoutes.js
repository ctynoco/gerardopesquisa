const { Router } = require('express')
const { cruzamentos, cruzamentosCompleto } = require('../controllers/cruzamentosController')
const { authenticate } = require('../middleware/auth')

const router = Router()

router.get('/cruzamentos/:pesquisa_id', authenticate, cruzamentos)
router.get('/cruzamentos/:pesquisa_id/completo', authenticate, cruzamentosCompleto)

module.exports = router
