const express = require('express')
const { create, getById, updateUser, getAll, deleteProfilePict } = require('../service/UserService') // Pastikan import updateUser
const router = express.Router()
const upload = require('../middleware/UploadProfilePictMiddleware')

router.post('/', create)
router.get('/', getAll)
router.get('/:id', getById)
router.delete('/delete-profile-pict', deleteProfilePict)
router.put('/', upload.single('picture'), updateUser)

module.exports = router
