// Router
const express = require('express');
const router = express.Router();
const routerPengesahan = require('./pengesahan');

// Hubungan DB
require('../konfig/pangkalan_data').connect(); 

// Perisian tengah
const pengesahanToken = require('../middleware/pengesahanToken');

// Penyulitan
const bcrypt = require('bcryptjs');

// Model data
const Pengelola = require('../model/Pengelola');
const Validasi = require('../model/Validasi');

// Utility function
const janaTokenJWT = require('../util/janaTokenJWT');
const { default: mongoose } = require('mongoose');

/* POST cipta akaun pelanggan

*/
router.post('/daftar', async (req, res) => {
    try {
        // Dapatkan nilai input
        const { emel, namaAkaun, namaPenuh, katalaluan } = req.body;

        // Memastikan nilai tidak kosong
        if (!(emel && namaAkaun && namaPenuh && katalaluan)) {
            return res.status(400).send("Butiran tidak lengkap. Sila lengkapkan butiran anda.");
        }

        // Memastikan emel belum diambil oleh pengelola lain
        const pengelolaLama = await Pengelola.findOne({ emel });

        if (pengelolaLama) {
            return res.status(409).send('Emel sudah digunakan')
        }

        const tarikh = new Date().toLocaleDateString();

        // Menyulitkan kata laluan pengelola supaya tidak boleh dibaca
        const kataLaluanDisulit = await bcrypt.hash(katalaluan, 10);

        // Mencipta akaun pengelola
        const pengelola = new Pengelola ({
            emel,
            namaAkaun,
            namaPenuh,
            tarikhMasa: {
                daftar: tarikh,
                logMasukTerakhir: tarikh
            }
        });

        // Menyimpan maklumat dalam pangkalan data
        pengelola.save(function (err) {
            console.log(pengelola._id)
            if (err) return res.status(500).send("Ralat dalaman server");

            const validasi = new Validasi({
                pengelola: pengelola._id,
                katalaluan: kataLaluanDisulit,
            });

            const muatan = { _id: validasi._id }

            // Membuat token baharu
            const token = janaTokenJWT(muatan, { secretEnvKey: 'TOKEN_KEY', expiresIn: '30m' });

            // Membuat refresh token baharu
            const refreshToken = janaTokenJWT(muatan, { secretEnvKey: 'REFRESH_TOKEN_KEY' });

            validasi.refreshToken = [refreshToken]

            validasi.save(function (err) {
                if (err) throw err
            });

            res.status(201).send({ token, refreshToken })
        });

    } catch (err) {
        // Ralat berlaku
        console.log(err);
        res.status(500).send({ mesej: 'Masalah dalaman server' });
    }
});

/*  Route V&V (Verification & Validation)
*/
router.use('/', routerPengesahan);

router.use(pengesahanToken);

/*  GET semua pelanggan

*/
router.get('/semua', async (req, res) => {
    const koleksi = await Pengelola.find({});
    res.status(200).send(koleksi);
});

/*  GET pelanggan

*/
router.get('/', async (req, res) => {
    try {
        // Dapatkan params dan maklumat pengelola
        const { _id } = req.pengelola;

        // Mendapatkan keseluruhan maklumat pengelola
        const maklumatpengelola = await Pengelola.findById(_id);

        return res.status(200).json(maklumatpengelola);
    } catch (err) {
        // Ralat berlaku
        console.log(err);
        res.status(500).send({ mesej: 'Masalah dalaman server' });
    }
});

router.get('/validasi', async (req, res) => {
    const validasi = await Validasi.findById("629c222dd8e2261b68d97cc9").populate('pengelola')

    res.status(200).send( validasi)
})


/*  PUT (kemas kini) pelanggan

*/
router.put('/kemas_kini', async (req, res) => {
    try {
        const { _id } = req.pengelola;

        // Mencari pengelola
        const pengelola = await Pengelola.findById({ _id });

        // Memastikan pengelola wujud
        if (!pengelola) {
            return res.status(403).send({ mesej: 'pengelola tidak wujud' });
        }

        const { nama, kata_laluan_lama, kata_laluan_baharu } = req.body;

        // Jika pengelola ingin mengemaskini KATA LALUAN...
        // Menguji jika parameter kata laluan lama diberi
        if (kata_laluan_baharu) {

            // Memastikan kesahan kata laluan lama
            if (!(await bcrypt.compare(kata_laluan_lama ?? '', pengelola.kata_laluan))) {
                return res.status(400).send({ mesej: 'Kata laluan salah' });
            }

            // Menyulitkan kata laluan
            const kataLaluanDisulit = await bcrypt.hash(kata_laluan_baharu, 10);

            // Mengemaskini kata laluan pengelola
            pengelola.kata_laluan = kataLaluanDisulit;
        }

        // Memastikan nama diberikan
        if (!nama) {
            return res.status(400).send({ mesej: 'Nama diperlukan' });
        }

        // Mengemaskini nama pengelola
        pengelola.nama = nama;

        // Menyimpan maklumat dalam pangkalan data
        pengelola.save();

        res.status(400).send(pengelola)
    } catch (err) {
        console.log(err);
        res.status(500).send({ mesej: 'Masalah dalaman server' });
    }
});

router.get('/validasi', (req, res) => {
    res.status(200).send({ sah: true });
});

/* POST log keluar
*/
router.post('/log_keluar', async (req, res) => {

    // Mencari validasi pengelola
    const validasi = await Validasi.findOne({ pengelola_id: req.pengelola._id });

    if (!validasi) {
        return res.status(403).send({ mesej: 'pengelola tidak wujud' })
    }

    // Menghapuskan semua akses refresh token
    validasi.refresh_token = [];

    validasi.save();

    res.status(200).send({ mesej: 'Log keluar berjaya' });
});

// Mengeksport router untuk digunakan oleh aplikasi
module.exports = router;