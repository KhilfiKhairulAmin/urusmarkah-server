const { Schema, model } = require('mongoose');

const skemaValidasi = new Schema ({
    pengelola: { type: Schema.Types.ObjectId, ref: 'pengelola', unique: false },
    katalaluan: { type: String, required: true },
    refreshToken: { type: [String], default: [] }
});

module.exports = model('validasi', skemaValidasi, 'validasi');