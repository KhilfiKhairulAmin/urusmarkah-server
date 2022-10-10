// Mengendalikan HTTP request
const express = require('express');
const router = express.Router();

// Menyediakan algoritma penyulitan
const bcrypt = require('bcryptjs');

// Menjana dan mengesahkan JWT (JSON Web Token)
const jwt = require('jsonwebtoken');

// Model data pengguna
const Pengelola = require('../model/Pengelola');
const Validasi = require('../model/Validasi');

// Utility function
const janaTokenJWT = require('../util/janaTokenJWT');
const Ralat = require('../util/Ralat');
const kendaliRalatMongoose = require('../util/kendaliRalatMongoose');
/* POST log masuk akaun pengguna

*/
router.post('/log_masuk', async (req, res) => {
    try {
        // Dapatkan nilai input
        const { emel, katalaluan } = req.body;

        // Memastikan input tidak kosong
        if (!(emel && katalaluan)) throw new Ralat('emel | katalaluan', 'Sila berikan nama dan katalaluan');

        // Mencari pengguna
        const pengelola = await Pengelola.findOne({ emel }, 'validasi tarikhMasa').populate('validasi', 'katalaluan');

        if (!pengelola) throw new Ralat('katalaluan', 'Katalaluan atau emel salah');

        // Memastikan pengguna wujud dan kata laluan betul
        if (!((await bcrypt.compare(katalaluan, pengelola.validasi.katalaluan)))) throw new Ralat('katalaluan', 'Katalaluan atau emel salah');

        const { validasi } = pengelola;

        const muatan = { validasi: validasi._id, pengelola: pengelola._id }

        // Membuat token baharu
        const token = janaTokenJWT(muatan, { secretEnvKey: 'TOKEN_KEY', expiresIn: process.env.MASA });

        // Membuat refresh token baharu
        const refreshToken = janaTokenJWT(muatan, { secretEnvKey: 'REFRESH_TOKEN_KEY'});

        // const validasi = await Validasi.findById(pengelola.validasi._id, 'refreshToken');
        validasi.refreshToken = [refreshToken];
        pengelola.tarikhMasa.logMasukTerakhir = new Date();
        validasi.save();

        // Menghantar response
        return res.status(200).json({ token, refreshToken });

    } catch (ralat) {
        kendaliRalatMongoose(res, ralat, 'Sila pastikan butiran log masuk diberikan');
    }
});

router.get('/refresh_token', async (req, res) => {
    try {
        // Dapatkan token daripada request headers
        const authorization = req.headers['authorization'];
        const bearer = authorization.split(' ');
        const refreshTokenDiberi = bearer[1];
        
        // Memastikan refresh token wujud
        if(!refreshTokenDiberi) throw new Ralat('refreshToken', 'Sila berikan refresh token');

        // Mendapatkan pengguna yang memegang refresh token tersebut
        const validasi = await Validasi.findOne({ refreshToken: refreshTokenDiberi });

        // Memastikan ada pengguna yang memegang refresh token
        if(!validasi) throw new Ralat('Pencarian', 'Token tidak wujud');

        // Memastikan refresh token merupakan refresh token yang terkini
        if (refreshTokenDiberi !== validasi.refreshToken[0]) {
            // Jika refresh token merupakan refresh token lama
            // Menghapuskan semua refresh token
            validasi.refreshToken = [];
            validasi.save();

            throw new Ralat('Tidak sah', 'Anda perlu log masuk semula')
        }

        let muatanLama;

        try {
            // Menguji sama ada refresh token belum luput
            muatanLama = jwt.verify(refreshTokenDiberi, process.env.REFRESH_TOKEN_KEY);

        } catch (ralat) {
            // Menghapuskan semua refresh token
            validasi.refreshToken = [];
            validasi.save();

            throw new Ralat('Luput', 'Anda perlu log masuk semula')
        }

        const { pengelola } = muatanLama;
        
        const muatan = {
            pengelola,
            validasi: validasi._id
        }

        // Menajana token dan refresh token baharu
        const token = janaTokenJWT(muatan, { secretEnvKey: 'TOKEN_KEY', expiresIn: process.env.MASA });
        const refreshToken = janaTokenJWT(muatan, { secretEnvKey: 'REFRESH_TOKEN_KEY' });

        // Memasukkan refresh token terkini ke dalam pengguna
        validasi.refreshToken.unshift(refreshToken);
        validasi.save();

        res.status(201).json({ token, refreshToken })

    } catch (ralat) {
        kendaliRalatMongoose(res, ralat, 'Refresh token tidak sah');
    }
});

// Mengeksport router untuk digunakan oleh aplikasi
module.exports = router;