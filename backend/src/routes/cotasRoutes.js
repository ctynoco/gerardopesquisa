const { Router } = require('express')
const { getCotas, setCotas } = require('../controllers/cotasController')
const { authenticate } = require('../middleware/auth')

const router = Router()
router.get('/pesquisas/:pesquisa_id/cotas', authenticate, getCotas)
router.put('/pesquisas/:pesquisa_id/cotas', authenticate, setCotas)

module.exports = router
