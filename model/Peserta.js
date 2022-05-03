const { Schema, model } = require('mongoose');
const skemaMarkah = require('./Markah');

const skemaPeserta = new Schema({
    pertandingan_id: { type: String },
    nama_peserta: { type: String },
    markah: [{
        jumlah: { type: Number, required: true },
        atribut: { type: Object }
    }],
    maklumat_tambahan: { type: Object }
});

module.exports = model('peserta', skemaPeserta, 'peserta');