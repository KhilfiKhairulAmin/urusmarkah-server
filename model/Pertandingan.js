const { Schema, model } = require('mongoose');

const skemaPengiraan = new Schema({
    caraPengiraanMarkah: { type: String }
})

const skemaPemilihan = new Schema({
    caraPemilihanPemenang: { type: String }
})

const skemaPertandingan = new Schema({
    idPengelola: { type: String, required: true },
    namaPertandingan: { type: String, required: true },
    deskripsi: { type: String },
    pengiraan: skemaPengiraan,
    pemilihan: skemaPemilihan,
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