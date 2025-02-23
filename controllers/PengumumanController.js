const express = require('express')
const {
  getAll,
  create,
  getById,
  remove,
  update,
} = require('../service/PengumumanService')
const router = express.Router()
const upload = require('../middleware/UploadFilePengumumanMiddleware')

router.get('/', getAll)
router.post('/', upload.array('files'), create)
router.get('/:id', getById)
router.delete('/:id', remove)
router.put('/:id', upload.array('files'), update)

module.exports = router
