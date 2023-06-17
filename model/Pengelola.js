const { Schema, model } = require('mongoose');

const skemaPengelola = new Schema({
    emel: { type: String, required: true},
    namaAkaun: { type: String, required: true },
    namaPenuh: { type: String, required: true },
    tarikhMasa: {
        daftar: { type: Date},
        logMasukTerakhir: { type: Date}
    },
    validasi: { type: Schema.Types.ObjectId, ref: 'validasi' }
});

module.exports = model('pengelola', skemaPengelola, 'Pengelola');
