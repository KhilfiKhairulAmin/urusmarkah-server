const express = require("express");
require('dotenv').config()
const aplikasi = express();
const cors = require('cors');


aplikasi.use(cors(), express.json());

// Penetapan router yang digunakan
const indexRoute = require('./api/v1/index');
aplikasi.use('/', indexRoute);

const penggunaRoute = require('./api/v1/pengguna');
aplikasi.use('/api/v1/pengguna', penggunaRoute);

module.exports = aplikasi;