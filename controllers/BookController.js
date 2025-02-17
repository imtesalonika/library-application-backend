const express = require('express')
const {
  getAll,
  create,
  getById,
  remove,
  update,
} = require('../service/BookService')
const authMiddleware = require('../middleware/AuthMiddleware')
const upload = require('../middleware/UploadBookPictureMiddleware')
const router = express.Router()

router.get('/', getAll)
router.post('/', upload.single('gambar'), create)
router.get('/:i d', getById)
router.delete('/:id', remove)
router.put('/:id', upload.single('gambar'), update)

module.exports = router
