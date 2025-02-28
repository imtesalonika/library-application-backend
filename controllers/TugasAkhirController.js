const express = require('express')
const {
  getAll,
  create,
  getById,
  remove,
  update,
  getByProgram, // Tambahkan fungsi ini
} = require('../service/TugasAkhirService')
const authMiddleware = require('../middleware/AuthMiddleware')
const router = express.Router()

router.get('/', getAll)
router.get('/by-program', getByProgram) // Endpoint baru
router.get('/:id', getById)
router.post('/', create)
router.delete('/:id', remove)
router.put('/:id', update)

module.exports = router
