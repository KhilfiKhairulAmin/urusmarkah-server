const { Schema, model } = require('mongoose');

const skemaPengiraan = new Schema({
    caraPengiraanMarkah: { type: String }
})

const skemaPemilihan = new Schema({
    caraPemilihanPemenang: { type: String }
})

const skemaPertandingan = new Schema({
    idPengguna: { type: String, required: true },
    namaPertandingan: { type: String, required: true },
    deskripsi: { type: String },
    pengiraan: skemaPengiraan,
    pemilihan: skemaPemilihan,
    tarikh: {
        cipta: Date,
        laksana: Date,
        tamat: Date
    },
    bilPusingan: Number
});

module.exports = model('pertandingan', skemaPertandingan, 'pertandingan');