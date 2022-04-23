const jwt = require('jsonwebtoken');

const config = process.env;

const verifyToken = (req, res, next) => {
    const token = 
        req.body.token || req.query.token || req.headers['x-access-token'];

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

module.exports = verifyToken;