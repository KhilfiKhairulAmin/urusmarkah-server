const { Schema, model } = require('mongoose');

const skemaMarkah = new Schema({
    peserta: { type: Schema.Types.ObjectId, ref: 'peserta', required: true },
    pertandingan: { type: Schema.Types.ObjectId, ref: 'pertandingan', required: true},
    kriteria: { type: [Object] },
    kedudukan: Number
});

module.exports = model('markah', skemaMarkah, 'markah');