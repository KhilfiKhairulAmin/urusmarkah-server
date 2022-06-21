const express = require("express");
require('dotenv').config()
const aplikasi = express();
const cors = require('cors');

aplikasi.use(cors(), express.json());

// Penetapan router yang digunakan
const routeIndex = require('./api/index');
aplikasi.use('/', routeIndex);

const routePengelola = require('./api/pengelola');
aplikasi.use('/api/v1/pengelola', routePengelola);

const routePeserta = require('./api/peserta');
aplikasi.use('/api/v1/peserta', routePeserta);

const routePertandingan = require('./api/pertandingan');
const pengesahanToken = require("./middleware/pengesahanToken");
aplikasi.use('/api/v1/pertandingan', pengesahanToken, routePertandingan);

const routeUrusmarkah = require('./api/urusmarkah');
aplikasi.use('/api/v1/urusmarkah', pengesahanToken, routeUrusmarkah)
module.exports = aplikasi;