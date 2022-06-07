const { Schema, model } = require('mongoose');

const skemaPertandingan = new Schema({
<<<<<<< HEAD
    pengguna_id: { type: String, required: true },
    nama_pertandingan: { type: String, required: true },
    deskripsi: { type: String, default: '' },
    maklumat_tambahan: { type: Object },
    konfigurasi: {
        cara_pengiraan_markah: { type: String, enum: [
            'Penambahan Tetap', 'Penambahan Dinamik', 'Kriteria', 'Unset'
        ], default: 'Unset'},
        cara_pemilihan_pemenang: { type: String, enum: [
            'Pertama Meraih N-Markah', 'Markah Tertinggi', 'Kriteria Terbaik', 'Peserta Terakhir', 'Unset'
        ], default: 'Unset'}
=======
    pengelola: { type: Schema.Types.ObjectId, required: true, ref: 'pengelola' },
    nama: { type: String, required: true },
    deskripsi: { type: String },
    pengiraan: { type: Schema.Types.ObjectId, ref: 'pengiraan', required: true },
    pemilihan: { type: Schema.Types.ObjectId, ref: 'pemilihan', required: true },
    tarikhMasa: {
        cipta: Date,
        laksana: Date,
        tamat: Date
>>>>>>> 0999df16afa9b408c3a2d8969fef998eb35486c9
    },
    bilPusingan: Number,
    bilPeserta: Number,
    statistik: {
        jumlah: Number,
        purata: Number,
        julat: Number,
        standardDeviation: Number
    }
});

module.exports = model('pertandingan', skemaPertandingan, 'pertandingan');