const { Schema, model } = require('mongoose');

const skemaPeserta = new Schema({
    emel: { type: String, required: true },
    namaAkaun: { type: String, required: true },
    namaPenuh: { type: String, required: true },
    noKP: { type: String, required: true },
    katalaluan: { type: String, required: true },
    tarikhMasaDaftar: Date
});

module.exports = model('peserta', skemaPeserta, 'peserta');