const { Schema, model } = require('mongoose');

const skemaPengguna = new Schema({
    emel: { type: String, unique: true},
    nama: { type: String },
    kata_laluan: { type: String },
    refreshToken: { type: [String] }
});

module.exports = model('pengguna', skemaPengguna, 'pengguna');
