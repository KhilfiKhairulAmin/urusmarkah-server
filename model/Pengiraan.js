const { Schema, model } = require('mongoose');

const skemaPemilihan = new Schema({
    nomborPengiraanMarkah: { type: Number, required: true },
    nama: { type: String, required: true }
});

module.exports = model('pemilihan', skemaPemilihan, 'pemilihan');