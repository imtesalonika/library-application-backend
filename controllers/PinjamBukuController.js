const express = require('express')
const {
  getAll,
  create,
  // getById,
  // remove,
  update,
  perpanjang,
} = require('../service/PinjamBukuService')
const router = express.Router()

router.get('/', getAll)
router.post('/', create)
// router.get('/:id', getById)
// router.delete('/:id', remove)
router.get('/perpanjang/:id', perpanjang)
router.patch('/:id', update)

module.exports = router
