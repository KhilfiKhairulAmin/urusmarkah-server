const { Schema, model } = require('mongoose');

const skemaPeserta = new Schema({
    pertandingan_id: { type: String, required: true },
    nama_peserta: { type: String, required: true },
});

module.exports = model('peserta', skemaPeserta, 'peserta');