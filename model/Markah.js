const { Schema, model } = require('mongoose');

const skemaMarkah = new Schema({
    peserta: { type: Schema.Types.ObjectId, ref: 'peserta', required: true },
    pertandingan: { type: Schema.Types.ObjectId, ref: 'pertandingan', required: true},
    markah: { type: Array, default: []},
    jumlah: { type: Number, default: 0 }
});

module.exports = model('markah', skemaMarkah, 'markah');