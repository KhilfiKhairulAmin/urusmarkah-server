const express = require("express");
const cors = require('cors');
const aplikasi = express();
aplikasi.use(cors())

// Penetapan router yang digunakan
const indexRoute = require('./api/v1/index');
aplikasi.use('/', indexRoute);

const penggunaRoute = require('./api/v1/pengguna');
aplikasi.use('/api/v1/pengguna', penggunaRoute);

module.exports = aplikasi;