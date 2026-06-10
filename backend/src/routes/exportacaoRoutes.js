const { Router } = require('express')
const { exportarPDF, exportarExcel, exportarCSV, exportarJSON } = require('../controllers/exportacaoController')
const { authenticate } = require('../middleware/auth')

const router = Router()

router.get('/pdf/:pesquisa_id', authenticate, exportarPDF)
router.get('/excel/:pesquisa_id', authenticate, exportarExcel)
router.get('/csv/:pesquisa_id', authenticate, exportarCSV)
router.get('/json/:pesquisa_id', authenticate, exportarJSON)

module.exports = router
