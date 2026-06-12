const { Router } = require('express')
const { painelSupervisao, producaoEntrevistadores } = require('../controllers/supervisaoController')
const { authenticate } = require('../middleware/auth')

const router = Router()
router.get('/supervisao/:pesquisa_id', authenticate, painelSupervisao)
router.get('/supervisao/:pesquisa_id/producao', authenticate, producaoEntrevistadores)

module.exports = router
