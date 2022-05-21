const { Schema, model } = require('mongoose');


const skemaPertandingan = new Schema({
    pengguna_id: { type: String, required: true },
    nama_pertandingan: { type: String, required: true },
    deskripsi: { type: String, default: '' },
    maklumat_tambahan: { type: Object },
    konfigurasi: {
        cara_pengiraan_markah: { type: String, enum: [
            'Penambahan Tetap', 'Penambahan Dinamik', 'Kriteria'
        ]},
        cara_pemilihan_pemenang: { type: String, enum: [
            'Pertama Meraih N-Markah', 'Markah Tertinggi', 'Kriteria Terbaik', 'Peserta Terakhir'
        ]}
    },
    status: { type: Number, enum: [
        0, 1, 2
    ], default: 0 },
    metadata: { tarikh_dibuat: Date, tarikh_berlangsung: Date, tarikh_tamat: Date }
});

module.exports = model('pertandingan', skemaPertandingan, 'pertandingan');