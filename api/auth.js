// Mengendalikan HTTP request
const express = require('express');
const router = express.Router();

// Menyediakan algoritma penyulitan
const bcrypt = require('bcryptjs');

// Menjana dan mengesahkan JWT (JSON Web Token)
const jwt = require('jsonwebtoken');

// Model data pengguna
const Pengguna = require('../model/Pengguna');
const Validasi = require('../model/Validasi');

/**
 * Fungsi standard bagi aplikasi untuk menjana JWT Token
 * @param {string | object | Buffer} payload Data yang mahu disimpan dalam token
 * @param {*} option Nama kunci rahsia dalam environment && masa luput JWT
 * @returns 
 */
const janaTokenJWT = (payload, { secretEnvKey, expiresIn = '10m' }) => {
    return jwt.sign(
        payload,
        process.env[secretEnvKey],
        {
            expiresIn: expiresIn
        }
    )
}

// Membuat hubungan dengan pangkalan data
require('../konfig/pangkalan_data').connect(); 

/* POST cipta akaun pelanggan

*/
router.post('/daftar', async (req, res) => {
    try {
        // Dapatkan nilai input
        const { emel, nama, kata_laluan } = req.body;
        
        // Memastikan nilai tidak kosong
        if (!(emel && nama && kata_laluan)) {
            return res.status(400).send({ mesej: 'Sila lengkapkan butiran anda'});
        }

        // Memastikan emel belum diambil oleh pengguna lain
        const penggunaLama = await Pengguna.findOne({ emel });

        if (penggunaLama) {
            return res.status(409).send({ mesej: 'Emel sudah digunakan'})
        }

        // Menyulitkan kata laluan pengguna supaya tidak boleh dibaca
        const kataLaluanDisulit = await bcrypt.hash(kata_laluan, 10);

        // Mencipta akaun Pengguna
        const pengguna = new Pengguna ({
            emel,
            nama,
            kata_laluan: kataLaluanDisulit
        });

        const muatan = { _id: pengguna._id };

        // Mencipta token dan refresh token baharu
        const token = janaTokenJWT(muatan, { secretEnvKey: 'TOKEN_KEY' })
        const refreshToken = janaTokenJWT(muatan, { secretEnvKey: 'REFRESH_TOKEN_KEY' })

        // Mencipta validasi
        const validasi = new Validasi ({
            pengguna_id: pengguna._id,
            refresh_token: refreshToken
        });

        // Menyimpan maklumat dalam pangkalan data
        pengguna.save();
        validasi.save();

        // Mengembalikan maklumat akaun dan token
        res.status(201).json({ token, refreshToken });

    } catch (err) {
        // Ralat berlaku
        console.log(err);
    }
});

/* POST log masuk akaun pengguna

*/
router.post('/log_masuk', async (req, res) => {
    try {
        // Dapatkan nilai input
        const { emel, kata_laluan } = req.body;

        // Memastikan input tidak kosong
        if (!(emel && kata_laluan)) {
            return res.status(400).send({ mesej: 'Sila lengkapkan butiran anda' });
        }

        // Mencari pengguna
        const pengguna = await Pengguna.findOne({ emel });

        // Memastikan pengguna wujud dan kata laluan betul
        if (pengguna && (await bcrypt.compare(kata_laluan, pengguna.kata_laluan))) {

            const muatan = { _id: pengguna._id }

            // Membuat token JWT baharu
            const token = janaTokenJWT(muatan, { secretEnvKey: 'TOKEN_KEY' });

            // Mencipta refresh token baharu
            const refreshToken = janaTokenJWT(muatan, { secretEnvKey: 'REFRESH_TOKEN_KEY' });

            // Memasukkan refresh token baharu
            const validasi = await Validasi.findOne({ pengguna_id: pengguna._id });
            validasi.refresh_token.unshift(refreshToken);
            validasi.save();

            // Menghantar response
            return res.status(200).json({ token, refreshToken });
        }

        res.status(400).send({ mesej: 'Emel atau kata laluan salah'});
    } catch (err) {
        console.log(err)
    }
});

router.post('/token', async (req, res) => {
    try {
        // Dapatkan token daripada request headers
        const authorization = req.headers['authorization'];
        const bearer = authorization.split(' ');
        const refreshTokenDiberi = bearer[1];

        // Memastikan refresh token wujud
        if(!refreshTokenDiberi) {
            return res.status(400).send({ mesej: 'Refresh token diperlukan'});
        }

        // Mendapatkan pengguna yang memegang refresh token tersebut
        const validasi = await Validasi.findOne({ refresh_token: refreshTokenDiberi });

        // Memastikan ada pengguna yang memegang refresh token
        if(!validasi) {
            return res.status(403).send({ mesej: 'Refresh token tidak wujud. Redirecting ke laman log masuk...'});
        }

        try {
            // Menguji sama ada refresh token belum luput
            jwt.verify(refreshTokenDiberi, process.env.REFRESH_TOKEN_KEY);
        } catch (err) {
            // Menghapuskan semua refresh token
            validasi.refresh_token = [];
            validasi.save();

            return res.status(403).send({ mesej: 'Refresh token tidak sah. Redirecting ke laman log masuk...'});
        }

        // Memastikan refresh token merupakan refresh token yang terkini
        if (refreshTokenDiberi !== validasi.refresh_token[0]) {
            // Jika refresh token merupakan refresh token lama
            // Menghapuskan semua refresh token
            validasi.refresh_token = [];
            validasi.save();

            return res.status(403).send({ mesej: 'Refresh token tidak sah. Redirecting ke laman log masuk...'});
        }

        // Pengguna yang sah
        const muatan = { _id: validasi._id };

        // Menajana token dan refresh token baharu
        const token = janaTokenJWT(muatan, { secretEnvKey: 'TOKEN_KEY' });
        const refreshToken = janaTokenJWT(muatan, { secretEnvKey: 'REFRESH_TOKEN_KEY' });

        // Memasukkan refresh token terkini ke dalam pengguna
        validasi.refresh_token.unshift(refreshToken);
        validasi.save();

        res.status(201).json({ token, refreshToken })

    } catch (err) {
        console.log(err);
        return res.status(500).send({ mesej: 'Masalah dalaman server' });
    }
});

// Mengeksport router untuk digunakan oleh aplikasi
module.exports = router;