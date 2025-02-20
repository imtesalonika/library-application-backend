const mysql = require('mysql2/promise')
const dotenv = require('dotenv')
const bcrypt = require('bcrypt')

dotenv.config()

const config = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  waitForConnections: true,
  connectionLimit: 10,
  maxIdle: 10,
  idleTimeout: 60000,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
}

const queries = [
  `DROP DATABASE IF EXISTS library_application_del`,
  `CREATE DATABASE library_application_del`,
  `USE library_application_del`,
  `CREATE TABLE buku (
        id int PRIMARY KEY AUTO_INCREMENT,
        judul VARCHAR(255) NOT NULL,
        penulis VARCHAR(255) NOT NULL,
        penerbit VARCHAR(255) NOT NULL,
        tahun_terbit INT NOT NULL,
        isbn VARCHAR(255),
        jumlah_halaman INT NOT NULL,
        bahasa VARCHAR(255) NOT NULL,
        edisi VARCHAR(10),
        abstrak TEXT NOT NULL,
        status BOOLEAN NOT NULL DEFAULT FALSE,
        banyak_buku INT NOT NULL DEFAULT 0,
        gambar VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`,
  `CREATE TABLE tugasakhir (
        id int PRIMARY KEY AUTO_INCREMENT,
        judul VARCHAR(255) NOT NULL,
        penulis VARCHAR(255) NOT NULL,
        pembimbing VARCHAR(255) NOT NULL,
        fakultas VARCHAR(255) NOT NULL,
        prodi VARCHAR(100) NOT NULL,
        katakunci VARCHAR(100) NOT NULL,
        tahun VARCHAR(100) NOT NULL,
        lokasi VARCHAR(100) NOT NULL,
        abstrak TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );`,
  `CREATE TABLE pengumuman (
        id int PRIMARY KEY AUTO_INCREMENT,
        judul VARCHAR(255) NOT NULL,
        isi TEXT NOT NULL,
        file JSON,
        kategori VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );`,
  `CREATE TABLE users (
        id int PRIMARY KEY,
        name VARCHAR(255),
        username VARCHAR(30),
        email VARCHAR(255),
        role VARCHAR(255),
        status boolean,
        jabatan VARCHAR(30),
        foto_profil VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );`,
  `
    CREATE TABLE peminjaman (
  id INT(11) AUTO_INCREMENT PRIMARY KEY,
  id_buku INT(11),
  id_user INT(11),
  tanggal_pinjam TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  tanggal_kembali TIMESTAMP NULL,
  status VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (id_buku) REFERENCES buku(id),
  FOREIGN KEY (id_user) REFERENCES users(id)
);
    `,
]
;(async () => {
  const connection = await mysql.createConnection(config)

  try {
    console.log('Migration dimulai!')

    for (const e of queries) {
      await connection.query(e)
      console.log(`Query berhasil dieksekusi: ${e}\n`)
    }

    console.log('Migrasi berhasil!')
  } catch (error) {
    console.error('Terjadi kesalahan saat migrasi:', error)
  } finally {
    await connection.end()
  }
})()
