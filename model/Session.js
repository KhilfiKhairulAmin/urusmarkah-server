const { Schema, model } = require('mongoose');

const skemaSession = new Schema({
    peserta: { type: Schema.Types.ObjectId, ref: 'peserta', required: true }
});

module.exports = model('session', skemaSession, 'session');