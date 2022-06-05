const { Schema, model } = require('mongoose');

const skemaPengelola = new Schema({
    emel: { type: String, required: true},
    namaAkaun: { type: String, required: true },
    namaPenuh: { type: String, required: true },
    tarikhMasa: {
        daftar: Date,
        logMasukTerakhir: Date
    }
});

module.exports = model('pengelola', skemaPengelola, 'pengelola');
