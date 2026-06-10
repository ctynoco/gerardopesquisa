const { Router } = require('express')
const { listar, criar, estatisticas } = require('../controllers/respostasController')
const { authenticate } = require('../middleware/auth')

const router = Router()

router.get('/', authenticate, listar)
router.post('/', authenticate, criar)
router.get('/estatisticas/:pesquisa_id', authenticate, estatisticas)

module.exports = router
