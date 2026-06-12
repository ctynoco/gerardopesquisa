const { Router } = require('express')
const { register, login, perfil } = require('../controllers/authController')
const { authenticate } = require('../middleware/auth')
const { validate, registerSchema, loginSchema } = require('../middleware/validate')

const router = Router()

router.post('/register', validate(registerSchema), register)
router.post('/login', validate(loginSchema), login)
router.get('/perfil', authenticate, perfil)

module.exports = router
