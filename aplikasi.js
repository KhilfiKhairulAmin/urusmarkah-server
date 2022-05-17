const express = require("express");
require('dotenv').config()
const aplikasi = express();
const cors = require('cors');

aplikasi.use(cors(), express.json());

// Penetapan router yang digunakan
const routeIndex = require('./api/index');
aplikasi.use('/', routeIndex);

const routePengguna = require('./api/pengguna');
const pengesahanToken = require("./middleware/pengesahanToken");
aplikasi.use('/api/v1/pengguna', routePengguna);

const routePertandingan = require('./api/pertandingan');
aplikasi.use('/api/v1/pertandingan', pengesahanToken, routePertandingan);

module.exports = aplikasi;