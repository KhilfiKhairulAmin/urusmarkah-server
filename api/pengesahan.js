// Mengendalikan HTTP request
const express = require('express');
const router = express.Router();

// Menyediakan algoritma penyulitan
const bcrypt = require('bcryptjs');

// Menjana dan mengesahkan JWT (JSON Web Token)
const jwt = require('jsonwebtoken');

// Model data pengguna
const Pengguna = require('../model/Pengelola');
const Validasi = require('../model/Validasi');

// Utility function
const janaTokenJWT = require('../util/janaTokenJWT');
const Pengelola = require('../model/Pengelola');

/* POST log masuk akaun pengguna

*/
router.post('/log_masuk', async (req, res) => {
    try {
        // Dapatkan nilai input
        const { emel, katalaluan } = req.body;

        // Memastikan input tidak kosong
        if (!(emel && katalaluan)) {
            return res.status(400).send({ mesej: 'Sila lengkapkan butiran anda' });
        }

        // Mencari pengguna
        const pengelola = await Pengguna.findOne({ emel }, 'validasi').populate('validasi', 'katalaluan');

        // Memastikan pengguna wujud dan kata laluan betul
        if (pengelola && (await bcrypt.compare(katalaluan, pengelola.validasi.katalaluan))) {

            const { validasi } = pengelola;

            const muatan = { validasi: validasi._id, pengelola: pengelola._id }

            // Membuat token baharu
            const token = janaTokenJWT(muatan, { secretEnvKey: 'TOKEN_KEY', expiresIn: '30m' });

            // Membuat refresh token baharu
            const refreshToken = janaTokenJWT(muatan, { secretEnvKey: 'REFRESH_TOKEN_KEY'});

            // const validasi = await Validasi.findById(pengelola.validasi._id, 'refreshToken');
            validasi.refreshToken = [refreshToken];
            validasi.save();

            // Menghantar response
            return res.status(200).json({ token, refreshToken });
        }

        res.status(400).send({ mesej: 'Emel atau kata laluan salah'});
    } catch (err) {
        console.log(err)
        res.status(500).send({ mesej: 'Masalah dalaman server' });
    }
});

router.get('/refresh_token', async (req, res) => {
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
        const validasi = await Validasi.findOne({ refreshToken: refreshTokenDiberi });

        // Memastikan ada pengguna yang memegang refresh token
        if(!validasi) {
            return res.status(400).send({ mesej: 'Refresh token tidak dikenali'});
        }

        // Memastikan refresh token merupakan refresh token yang terkini
        if (refreshTokenDiberi !== validasi.refreshToken[0]) {
            // Jika refresh token merupakan refresh token lama
            // Menghapuskan semua refresh token
            validasi.refreshToken = [];
            validasi.save();

            return res.status(403).send({ mesej: 'Refresh token luput diberi. Anda perlu log masuk semula untuk mengesahkan identiti anda'});
        }

        let muatanLama;

        try {
            // Menguji sama ada refresh token belum luput
            muatanLama = jwt.verify(refreshTokenDiberi, process.env.REFRESH_TOKEN_KEY);
            console.log(muatanLama)
        } catch (err) {
            // Menghapuskan semua refresh token
            validasi.refreshToken = [];
            validasi.save();

            return res.status(403).send({ mesej: 'Refresh token luput. Anda perlu log masuk semula untuk mendapatkan akses'});
        }

        const { pengelola } = muatanLama;
        
        const muatan = {
            pengelola,
            validasi: validasi._id
        }

        // Menajana token dan refresh token baharu
        const token = janaTokenJWT(muatan, { secretEnvKey: 'TOKEN_KEY', expiresIn: '30m' });
        const refreshToken = janaTokenJWT(muatan, { secretEnvKey: 'REFRESH_TOKEN_KEY' });

        // Memasukkan refresh token terkini ke dalam pengguna
        validasi.refreshToken.unshift(refreshToken);
        validasi.save();

        res.status(201).json({ token, refreshToken })

    } catch (err) {
        console.log(err);
        return res.status(500).send({ mesej: 'Masalah dalaman server' });
    }
});

// Mengeksport router untuk digunakan oleh aplikasi
module.exports = router;