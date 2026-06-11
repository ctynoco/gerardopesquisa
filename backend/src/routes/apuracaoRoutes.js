const { Router } = require('express')
const { apuracao, evolucao } = require('../controllers/apuracaoController')
const { authenticate } = require('../middleware/auth')

const router = Router()
router.get('/apuracao/:pesquisa_id', authenticate, apuracao)
router.get('/apuracao/:pesquisa_id/evolucao', authenticate, evolucao)

module.exports = router
