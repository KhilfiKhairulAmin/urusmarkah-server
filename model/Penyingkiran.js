const { Schema, model } = require('mongoose');

const skemaPenyingkiran = new Schema({
    nama: { type: String, required: true, unique: true },
    noRujukan: { type: Number, required: true }
});

module.exports = model('penyingkiran', skemaPenyingkiran, 'penyingkiran');