const { Schema, model } = require('mongoose');

const skemaMarkah = new Schema({
    peserta_id: { type: String, required: true },
    markah: [{
        jumlah: { type: Number, required: true },
        atribut: { type: Object },
        kedudukan_akhir: { type: Number }
    }]
});

module.exports = model('markah', skemaMarkah, 'markah');