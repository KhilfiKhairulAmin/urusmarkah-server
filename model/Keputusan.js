const { Schema, model } = require('mongoose');

const skemaKeputusan = new Schema({
    idPeserta: { type: Schema.Types.ObjectId, ref: 'peserta', required: true},
    idPertandingan: { type: Schema.Types.ObjectId, ref: 'pertandingan', required: true},
    kedudukanAkhir: Number
})