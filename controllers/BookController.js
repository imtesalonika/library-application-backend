const express = require('express')
const {
  getAll,
  create,
  getById,
  remove,
  update,
  addToFavorite,
  getFavorite,
  removeFromFavorite,
} = require('../service/BookService')
const authMiddleware = require('../middleware/AuthMiddleware')
const upload = require('../middleware/UploadBookPictureMiddleware')
const router = express.Router()

router.get('/', getAll)
router.post('/', upload.single('gambar'), create)
router.post('/favorite', addToFavorite)
router.delete('/remove-favorite', removeFromFavorite)
router.get('/favorite/:user_id', getFavorite)
router.get('/:id', getById)
router.delete('/:id', remove)
router.put('/:id', upload.single('gambar'), update)

module.exports = router
