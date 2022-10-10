const jwt = require('jsonwebtoken');

/**
 * Fungsi untuk menjana JWT Token
 * @param {string | object | Buffer} payload Data yang mahu disimpan dalam token
 * @param {*} option Nama kunci rahsia dalam environment && masa luput JWT
 * @returns Token JWT
 */
module.exports = function janaTokenJWT (payload, { secretEnvKey, expiresIn = process.env.MASA_REFRESH }) {
    return jwt.sign(
        payload,
        process.env[secretEnvKey],
        {
            expiresIn
        }
    )
}