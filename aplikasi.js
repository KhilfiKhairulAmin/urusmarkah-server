const express = require("express");
const aplikasi = express();

// Penetapan router yang digunakan
const indexRoute = require('./api/v1/index');
aplikasi.use('/', indexRoute);

const penggunaRoute = require('./api/v1/pengguna');
aplikasi.use('/api/v1/pengguna', penggunaRoute);

module.exports = aplikasi;