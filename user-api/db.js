const mariadb = require('mariadb');

// Pool koneksi MariaDB
const pool = mariadb.createPool({
  host: 'localhost',       // Host database
  user: 'root',            // Username MariaDB
  password: 'password',    // Password MariaDB
  database: 'user_db',     // Nama database
  connectionLimit: 5       // Maksimum koneksi
});

// Ekspor pool koneksi
module.exports = pool;
