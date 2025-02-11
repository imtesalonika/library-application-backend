const express = require('express')
const {
  getAll,
  create,
  getById,
  remove,
  update,
} = require('../service/TugasAkhirService')
const authMiddleware = require('../middleware/AuthMiddleware')
const router = express.Router()

router.get('/', getAll)
router.get('/:id', getById)
router.post('/', create)
router.delete('/:id', remove)

module.exports = router
