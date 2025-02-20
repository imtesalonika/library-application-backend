const express = require('express')
const { create, getById, updateUser } = require('../service/UserService') // Pastikan import updateUser
const router = express.Router()
const upload = require('../middleware/UploadProfilePictMiddleware')

router.post('/', create)
router.get('/:id', getById)
router.put('/', upload.single('picture'), updateUser)

module.exports = router
