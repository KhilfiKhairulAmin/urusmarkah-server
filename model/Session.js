const { Schema, model } = require('mongoose');

const skemaSession = new Schema ({
    peserta: { type: Schema.Types.ObjectId }
});

module.exports = model('session', skemaSession, 'session')