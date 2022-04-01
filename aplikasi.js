const express = require("express");
const aplikasi = express();

// Penetapan router yang digunakan
const indexRoute = require('./routes/index');
aplikasi.use('/', indexRoute);

const penggunaRoute = require('./routes/pengguna');
aplikasi.use('/pengguna', penggunaRoute);

module.exports = aplikasi