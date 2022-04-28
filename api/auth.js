// Mengendalikan HTTP request
const express = require('express');
const router = express.Router();

// Menyediakan algoritma penyulitan
const bcrypt = require('bcryptjs');

// Menjana dan mengesahkan JWT (JSON Web Token)
const jwt = require('jsonwebtoken');

// Model data pengguna
const Pengguna = require('../model/Pengguna');

// Mengendalikan kesahan dan kebenaran (authentication and authorization) pengguna
const pengesahan = require('../middleware/pengesahanToken')

// Import fungsi-fungsi kemudahan
const deleteUndefinedProps = require('../util/deleteUndefinedProps');

// Fungsi untuk menjana JWT Token bagi aplikasi ini
const generateJWTToken = (payload, { secretEnvKey, expiresIn = '10m' }) => {
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
            kata_laluan: kataLaluanDisulit,
            refreshToken: []
        });

        const muatan = { _id: pengguna._id };

        // Mencipta token baharu
        const token = generateJWTToken(muatan, { secretEnvKey: 'TOKEN_KEY' })

        // Mencipta refresh token baharu
        const refreshToken = generateJWTToken(muatan, { secretEnvKey: 'REFRESH_TOKEN_KEY' })

        pengguna.refreshToken.unshift(refreshToken);

        pengguna.save();

        // Mengembalikan maklumat akaun dan token
        return res.status(201).json({ token, refreshToken });

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

        // Mencari emel pengguna
        const pengguna = await Pengguna.findOne({ emel });

        // Memastikan pengguna wujud dan kata laluan betul
        if (pengguna && (await bcrypt.compare(kata_laluan, pengguna.kata_laluan))) {

            const muatan = { _id: pengguna._id }

            // Membuat token JWT baharu
            const token = generateJWTToken(muatan, { secretEnvKey: 'TOKEN_KEY' });

            // Mencipta refresh token baharu
            const refreshToken = generateJWTToken(muatan, { secretEnvKey: 'REFRESH_TOKEN_KEY' });

            // Memasukkan refresh token baharu
            await Pengguna.updateOne({ _id: pengguna._id }, {
                refreshToken: [refreshToken, ...pengguna.refreshToken]
            })

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
        const currentRefreshToken = bearer[1];

        if(!currentRefreshToken) {
            return res.status(400).send({ mesej: 'Refresh token diperlukan'});
        }

        const pengesahan = await Pengguna.findOne({ refreshToken: currentRefreshToken });

        if(!pengesahan) {
            return res.status(403).send({ mesej: 'Refresh token tidak wujud. Redirecting ke laman log masuk...'});
        }

        jwt.verify(currentRefreshToken, process.env.REFRESH_TOKEN_KEY);

        if (pengesahan.refreshToken[0] !== currentRefreshToken) {
            await Pengguna.updateOne({ _id: pengesahan._id }, {
                refreshToken: []
            });

            return res.status(403).send({ mesej: 'Refresh token tidak sah. Redirecting ke laman log masuk...'});
        }

        const muatan = { _id: pengesahan._id };

        const token = generateJWTToken(muatan, { secretEnvKey: 'TOKEN_KEY' });

        const refreshToken = generateJWTToken(muatan, { secretEnvKey: 'REFRESH_TOKEN_KEY' });

        await Pengguna.updateOne({ _id: pengesahan._id }, {
            $set: {refreshToken: [refreshToken, ...pengesahan.refreshToken]}
        })

        res.status(201).json({ token, refreshToken })

    } catch (err) {
        console.log(err);
        return res.status(403).send({ mesej: 'Token sudah luput'});
    }
});

// Mengeksport router untuk digunakan oleh aplikasi
module.exports = router;