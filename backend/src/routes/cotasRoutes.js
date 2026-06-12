const { Router } = require('express')
const { getCotas, setCotas } = require('../controllers/cotasController')
const { authenticate } = require('../middleware/auth')
const { setAuditInfo } = require('../middleware/audit')

const router = Router()
router.get('/pesquisas/:pesquisa_id/cotas', authenticate, getCotas)
router.put('/pesquisas/:pesquisa_id/cotas', authenticate, setAuditInfo('cotas'), setCotas)

module.exports = router
