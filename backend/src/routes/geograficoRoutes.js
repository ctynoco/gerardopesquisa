const { Router } = require('express')
const { distribuicao } = require('../controllers/geograficoController')
const { authenticate } = require('../middleware/auth')

const router = Router()

router.get('/distribuicao/:pesquisa_id', authenticate, distribuicao)

module.exports = router
