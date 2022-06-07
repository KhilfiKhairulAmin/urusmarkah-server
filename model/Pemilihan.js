const { Schema, model } = require('mongoose');

const skemaPemilihan = new Schema({
    nama: { type: String, required: true, unique: true }
});

module.exports = model('pemilihan', skemaPemilihan, 'pemilihan');