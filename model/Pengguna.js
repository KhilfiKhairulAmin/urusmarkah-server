const { Schema, model } = require('mongoose');

const skemaPengguna = new Schema({
    emel: { type: String, unique: true, required: true},
    namaAkaun: { type: String, required: true },
    namaAwal: String,
    namaAkhir: String,
    tarikhMasa: {
        daftar: Date,
        logMasukTerakhir: Date
    }
});

module.exports = model('pengguna', skemaPengguna, 'pengguna');
