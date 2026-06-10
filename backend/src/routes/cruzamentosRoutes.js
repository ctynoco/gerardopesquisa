const { Router } = require('express')
const { cruzamentos } = require('../controllers/cruzamentosController')
const { authenticate } = require('../middleware/auth')

const router = Router()

router.get('/cruzamentos/:pesquisa_id', authenticate, cruzamentos)

module.exports = router
