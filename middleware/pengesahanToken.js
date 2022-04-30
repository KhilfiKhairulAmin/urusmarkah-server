const jwt = require('jsonwebtoken');

const config = process.env;

const pengesahanToken = (req, res, next) => {
    // Dapatkan header request
    const authorization = req.headers['authorization'];
    const bearer = authorization.split(' ');
        
    // Dapatkan token
    const token = bearer[1];

    // Memastikan token wujud
    if(!token) {
        return res.status(400).send({ mesej: 'Token diperlukan'});
    }

    try {
        // Menyahsulitkan token
        const nyahsulit = jwt.verify(token, config.TOKEN_KEY);

        // Mengumpukkan nilai token
        req.pengguna = nyahsulit;

    } catch (err) {
        // Token tidak sah
        console.log(err);
        return res.status(403).send({ mesej: 'Token tidak sah'});
    }
    return next();
}

module.exports = pengesahanToken;