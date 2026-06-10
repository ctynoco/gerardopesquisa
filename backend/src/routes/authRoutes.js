const { Router } = require('express')
const { register, login, perfil } = require('../controllers/authController')
const { authenticate } = require('../middleware/auth')

const router = Router()

router.post('/register', register)
router.post('/login', login)
router.get('/perfil', authenticate, perfil)

module.exports = router
