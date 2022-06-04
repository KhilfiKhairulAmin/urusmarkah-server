const { Schema, model } = require('mongoose');

const skemaValidasi = new Schema ({
    idPengelola: { type: Schema.Types.ObjectId, required: true, ref: 'pengelola' },
    katalaluan: { type: String, required: true },
    refreshToken: { type: [String], default: [] }
});

module.exports = model('validasi', skemaValidasi, 'validasi');