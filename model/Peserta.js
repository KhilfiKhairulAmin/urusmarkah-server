const { Schema, model } = require('mongoose');

const skemaPeserta = new Schema({
    pertandingan_id: { type: String, required: true },
    nama_peserta: { type: String, required: true },
    maklumat_tambahan: {
        kunci_unik_peserta: { type: String },
        nota: { type: String }
    }
});

module.exports = model('peserta', skemaPeserta, 'peserta');