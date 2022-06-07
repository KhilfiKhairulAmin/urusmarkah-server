const { Schema, model } = require('mongoose');

const skemaKeputusan = new Schema({
    peserta: { type: Schema.Types.ObjectId, ref: 'peserta', required: true},
    pertandingan: { type: Schema.Types.ObjectId, ref: 'pertandingan', required: true},
    kedudukanAkhir: Number
})