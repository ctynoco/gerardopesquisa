const { Router } = require('express')
const { painelSupervisao } = require('../controllers/supervisaoController')
const { authenticate } = require('../middleware/auth')

const router = Router()
router.get('/supervisao/:pesquisa_id', authenticate, painelSupervisao)

module.exports = router
