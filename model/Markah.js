const { Schema, model } = require('mongoose');

const skemaMarkah = new Schema({
    idPeserta: { type: Schema.Types.ObjectId, ref: 'peserta', required: true },
    idPertandingan: { type: Schema.Types.ObjectId, ref: 'pertandingan', required: true},
    markah: { type: [Object] },
    kedudukan: Number
});

module.exports = model('markah', skemaMarkah, 'markah');