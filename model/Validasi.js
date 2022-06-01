const { Schema, model } = require('mongoose');

const skemaValidasi = new Schema ({
    idPengelola: { type: String, unique: true, required: true },
    katalaluan: { type: String, required: true },
    refreshToken: { type: [String], default: [] }
});

module.exports = model('validasi', skemaValidasi, 'validasi');