const { Schema, model } = require('mongoose');

const skemaPengelola = new Schema({
    emel: { type: String, unique: true, required: true},
    namaAkaun: { type: String, required: true },
    namaAwal: { type: String, required: true },
    namaAkhir: { type: String, required: true },
    tarikhMasa: {
        daftar: Date,
        logMasukTerakhir: Date
    }
});

module.exports = model('pengelola', skemaPengelola, 'pengelola');
