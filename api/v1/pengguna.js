// Mengendalikan HTTP request
const express = require('express');
const router = express.Router();

// Menyediakan algoritma penyulitan
const bcrypt = require('bcryptjs');

// Menjana dan mengesahkan JWT (JSON Web Token)
const jwt = require('jsonwebtoken');

// Model data pengguna
const Pengguna = require('../../model/Pengguna');

// Mengendalikan kesahan dan kebenaran (authentication and authorization) pengguna
const pengesahan = require('../../middleware/pengesahan')

// Import fungsi-fungsi kemudahan
const deleteUndefinedProps = require('../../util/deleteUndefinedProps');



// Membuat hubungan dengan pangkalan data
require('../../konfig/pangkalan_data').connect(); 

/*  GET semua pelanggan

*/
router.get('/semua', async (req, res) => {
    const koleksi = await Pengguna.find({});
    res.status(200).send(koleksi);
});

/*  GET pelanggan

*/
router.get('/pertandingan', pengesahan, async (req, res) => {
    try {
        // Dapatkan params dan maklumat pengguna
        const { pengguna_id } = req.pengguna;
        console.log(`id = ${pengguna_id}`);
        // Mendapatkan keseluruhan maklumat pengguna
        const maklumatPengguna = await Pengguna.findById(pengguna_id);

        return res.status(200).json(maklumatPengguna);
    } catch (err) {
        // Ralat berlaku
        console.log(err);
    }
})

/*  PUT (kemas kini) pelanggan

*/
router.put('/kemas_kini', pengesahan, async (req, res) => {
    try {
        // Dapatkan nilai input
        const { emel, nama, kata_laluan } = req.body;
        const { pengguna } = req;

        // Memastikan emel tidak kosong
        if (!emel) {
            return res.status(400).send({ mesej: 'Emel diperlukan'})
        }

        // Memastikan nama adalah sama
        if (pengguna.emel !== emel) {
            return res.status(403).send({ mesej: 'Aksi tidak dibenarkan' })
        }

        let kataLaluanDisulit;

        // Jika parameter kata laluan diberi
        if (kata_laluan) {
            // Menyulitkan kata laluan
            kataLaluanDisulit = await bcrypt.hash(kata_laluan, 10);
        }

        // Emel sebagai kunci unik, manakala nama dan kata laluan ialah kunci biasa yang boleh dikemaskini
        const tapisan = { emel };
        const kemas_kini = { $set : deleteUndefinedProps({ nama, kata_laluan: kataLaluanDisulit }) };

        // Mengemaskini maklumat pengguna
        await Pengguna.findOneAndUpdate(tapisan, kemas_kini, { new: true, runValidators: true }, (err, doc) => {
            if (err) throw err;
            return res.status(200).json(doc);
        });

    } catch (err) {
        console.log(err);
    }
})

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
        const pengguna = await Pengguna.create({
            emel,
            nama,
            kata_laluan: kataLaluanDisulit,
        });

        const muatan = { pengguna_id: pengguna._id, emel};

        // Mencipta token baharu
        const token = jwt.sign(
            muatan,
            process.env.TOKEN_KEY,
            {
                expiresIn: '3m'
            }
        );

        // Mencipta refresh token baharu
        const refreshToken = jwt.sign(
            muatan,
            process.env.REFRESH_TOKEN_KEY,
            {
                expiresIn: '5m'
            }
        );

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

            // Membuat token JWT baharu
            const token = jwt.sign(
                { pengguna_id: pengguna._id, emel, nama: pengguna.nama },
                process.env.TOKEN_KEY,
                {
                    expiresIn: '1h',
                }
            );

            // Mengumpukkan nilai token
            pengguna.token = token;

            // Menghantar response
            return res.status(200).json(pengguna);
        }

        res.status(400).send({ mesej: 'Emel atau kata laluan salah'});
    } catch (err) {
        console.log(err)
    }
});

// Mengeksport router untuk digunakan oleh aplikasi
module.exports = router;