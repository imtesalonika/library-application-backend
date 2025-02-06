const express = require('express')
const {
  getAll,
  create,
  getById,
  remove,
  update,
} = require('../service/PengumumanService')
const router = express.Router()
const authMiddleware = require('../middleware/AuthMiddleware')
const upload = require('../middleware/UploadProductMiddleware')

router.get('/', getAll)
router.post('/', upload.single('gambar'), create)
router.get('/:id', getById)
router.delete('/:id', remove)
router.put('/:id', upload.single('gambar'), update)

module.exports = router
