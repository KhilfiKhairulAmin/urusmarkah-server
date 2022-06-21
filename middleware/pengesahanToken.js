const jwt = require('jsonwebtoken');
const kendaliRalatMongoose = require('../util/kendaliRalatMongoose');
const Ralat = require('../util/Ralat');
const config = process.env;

const pengesahanToken = (req, res, next) => {
    try {
        // Dapatkan header request
        const authorization = req.headers['authorization'];

        if (!authorization) throw new Ralat('headers.authorization', 'Headers authorization diperlukan');

        const bearer = authorization.split(' ');
            
        // Dapatkan token
        const token = bearer[1];

        // Memastikan token wujud
        if(!token) throw new Ralat('token', 'Token diperlukan');

        // Menyahsulitkan token
        const nyahsulit = jwt.verify(token, config.TOKEN_KEY);

        // Mengumpukkan nilai token
        req.muatanToken = nyahsulit;

        return next();
    } catch (ralat) {
        kendaliRalatMongoose(res, ralat, 'Token tidak sah');
    }
}

module.exports = pengesahanToken;