const express = require('express')
const bodyParser = require('body-parser')
const userController = require('./controllers/UserController')
const authController = require('./controllers/AuthController')
const pengumumanController = require('./controllers/PengumumanController')
const bookController = require('./controllers/BookController')
const likeController = require('./controllers/LikeController')
const commentController = require('./controllers/PostCommentController')
const cors = require('cors')

const app = express()
const port = 3000

app.use(cors())

// Middleware untuk parsing JSON
app.use(bodyParser.json())

// Endpoint utama untuk mengecek status API
app.get('/', (req, res) => {
  res.send('User API is Running')
})

app.use('/api/users', userController)
app.use('/api/auth', authController)
app.use('/api/like', likeController)
app.use('/api/comment', commentController)
app.use('/api/pengumuman', pengumumanController)
app.use('/api/book', bookController)
app.use(express.static('public'))

// Jalankan server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`)
})
