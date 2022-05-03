const { Schema, model } = require('mongoose');

const skemaPeserta = new Schema({
    pertandingan_id: { type: String, required: true },
    nama_peserta: { type: String, required: true },
    markah: [{
        jumlah: { type: Number, required: true },
        atribut: { type: Object },
        kedudukan_akhir: { type: Number }
    }],
    maklumat_tambahan: {
        kunci_unik_peserta: { type: String },
        nota: { type: String }
    }
});

module.exports = model('peserta', skemaPeserta, 'peserta');