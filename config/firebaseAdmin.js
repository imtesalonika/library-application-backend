const admin = require('firebase-admin')

// Masukkan path ke service account JSON yang diunduh dari Firebase
const serviceAccount = require('../service-account.json')

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
})

module.exports = admin
