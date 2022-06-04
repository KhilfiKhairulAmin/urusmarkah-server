const { Schema, model } = require('mongoose');

const skemaPertandingan = new Schema({
    idPengelola: { type: Schema.Types.ObjectId, required: true, ref: 'pengelola' },
    namaPertandingan: { type: String, required: true },
    deskripsi: { type: String },
    pengiraan: { type: Schema.Types.ObjectId, ref: 'pengiraan' },
    pemilihan: { type: Schema.Types.ObjectId, ref: 'pemilihan' },
    tarikhMasa: {
        cipta: Date,
        laksana: Date,
        tamat: Date
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