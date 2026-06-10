const { Router } = require('express')
const { distribuicao, bairrosComCoordenadas, atualizarCoordenadas, mapaCompleto } = require('../controllers/geograficoController')
const { authenticate } = require('../middleware/auth')

const router = Router()

router.get('/distribuicao/:pesquisa_id', authenticate, distribuicao)
router.get('/geografico/bairros/:pesquisa_id', authenticate, bairrosComCoordenadas)
router.put('/geografico/bairros', authenticate, atualizarCoordenadas)
router.get('/geografico/mapa/:pesquisa_id', authenticate, mapaCompleto)

module.exports = router
