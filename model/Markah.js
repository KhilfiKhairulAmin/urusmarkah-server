const { Schema, model } = require('mongoose');

const skemaMarkah = new Schema({
    peserta: { type: Schema.Types.ObjectId, ref: 'peserta', required: true },
    pertandingan: { type: Schema.Types.ObjectId, ref: 'pertandingan', required: true},
    urusmarkah: { type: Object, default: {} }
});

module.exports = model('markah', skemaMarkah, 'markah');