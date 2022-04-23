const mongoose = require('mongoose');

const skemaPengguna = new mongoose.Schema({
    emel: { type: String, unique: true},
    nama: { type: String, default: null },
    kata_laluan: { type: String },
    token: { type: String }
});

module.exports = mongoose.model('pengguna', skemaPengguna, 'pengguna');
