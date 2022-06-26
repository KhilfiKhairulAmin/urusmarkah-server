const { Schema, model } = require('mongoose');

const skemaPertandingan = new Schema({
    pengelola: { type: Schema.Types.ObjectId, required: true, ref: 'pengelola' },
    nama: { type: String, required: true, maxlength: [255, 'Nama pertandingan tidak boleh melebihi 255 perkataan'] },
    tentang: {
        deskripsi: String,
        tarikhPelaksanaan: Date,
        syarat: { type: [String] },
        sumber: { type: [{
            nama: String,
            url: String
        }] }
    },
    bilPeserta: { type: Number, default: 0 },
    status: { type: Number, enum: [0, 1, 2], default: 0},
    tarikhMasa: {
        cipta: Date,
        laksana: Date,
        tamat: Date
    }
});

module.exports = model('pertandingan', skemaPertandingan, 'pertandingan');