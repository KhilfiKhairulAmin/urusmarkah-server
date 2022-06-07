const { Schema, model } = require('mongoose');

const skemaPeserta = new Schema({
    emel: { type: String, required: true },
    namaPenuh: { type: String, required: true },
    noKP: { type: Number, required: true },
    namaAkaun: { type: String, required: true },
    tarikhMasaDaftar: Date
});

module.exports = model('peserta', skemaPeserta, 'peserta');