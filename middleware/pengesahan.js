const jwt = require('jsonwebtoken');

const config = process.env;

const pengesahanToken = (req, res, next) => {
    const headers = req.headers['authorization'];

    const bearer = headers.split(' ');
        
    const token = bearer[1];

    if(!token) {
        return res.status(403).send({ mesej: 'Token diperlukan'});
    }

    try {
        const nyahsulit = jwt.verify(token, config.TOKEN_KEY);
        req.pengguna = nyahsulit;
    } catch (err) {
        return res.status(401).send({ mesej: 'Token tidak sah'});
    }
    return next();
}

module.exports = pengesahanToken;