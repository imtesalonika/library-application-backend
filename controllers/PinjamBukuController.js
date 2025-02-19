const express = require('express')
const {
  getAll,
  create,
  getById,
  remove,
  update,
} = require('../service/PinjamBukuService')
const router = express.Router()

router.get('/', getAll)
router.post('/', create)
router.get('/:id', getById)
router.delete('/:id', remove)
router.patch('/:id', update)

module.exports = router
