const { Router } = require('express')
const { listar } = require('../controllers/auditoriaController')
const { authenticate, authorize } = require('../middleware/auth')

const router = Router()

router.get('/', authenticate, authorize('admin'), listar)

module.exports = router
