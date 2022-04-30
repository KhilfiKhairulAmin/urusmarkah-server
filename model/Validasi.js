const { Schema, model } = require('mongoose');

const skemaValidasi = new Schema ({
    pengguna_id: { type: String, unique: true },
    refresh_token: { type: [String] }
});

module.exports = model('validasi', skemaValidasi, 'validasi');