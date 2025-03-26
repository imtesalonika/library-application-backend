const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const path = require('path')

const userController = require('./controllers/UserController')
const authController = require('./controllers/AuthController')
const pengumumanController = require('./controllers/PengumumanController')
const bookController = require('./controllers/BookController')
const likeController = require('./controllers/LikeController')
const commentController = require('./controllers/PostCommentController')
const tugasakhirController = require('./controllers/TugasAkhirController')
const pinjamBukuController = require('./controllers/PinjamBukuController')

const notificationController = require('./controllers/notificationController')

const app = express()
const port = 3000

// Middleware
app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// Route utama
app.get('/', (req, res) => {
  res.send('User API is Running')
})

// API Routes
app.use('/api/users', userController)
app.use('/api/auth', authController)
app.use('/api/like', likeController)
app.use('/api/comment', commentController)
app.use('/api/pengumuman', pengumumanController)
app.use('/api/book', bookController)
app.use('/api/tugasakhir', tugasakhirController)
app.use('/api/pinjam-buku', pinjamBukuController)
app.use('/api/notifications', notificationController)

// Static Files
app.use(
  '/uploads',
  express.static(path.join(__dirname, 'public/pengumuman_files'))
)
app.use(express.static('public'))

// Jalankan server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`)
})
