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

        // Menyulitkan kata laluan pengelola supaya tidak boleh dibaca
        const kataLaluanDisulit = await bcrypt.hash(katalaluan, 10);

        const validasi = new Validasi({
            katalaluan: kataLaluanDisulit
        });

        // Mencipta akaun pengelola
        const pengelola = new Pengelola ({
            emel,
            namaAkaun,
            namaPenuh,
            tarikhMasa: {
                daftar: new Date(),
                logMasukTerakhir: new Date()
            },
            validasi: validasi._id
        });

        const muatan = { validasi: validasi._id, pengelola: pengelola._id }

        // Membuat token baharu
        const token = janaTokenJWT(muatan, { secretEnvKey: 'TOKEN_KEY', expiresIn: '30m' });

        // Membuat refresh token baharu
        const refreshToken = janaTokenJWT(muatan, { secretEnvKey: 'REFRESH_TOKEN_KEY' });

        validasi.refreshToken = [refreshToken]

        validasi.save();
        pengelola.save();

        res.status(201).send({ token, refreshToken })

    } catch (err) {
        // Ralat berlaku
        console.log(err);
        res.status(500).send({ mesej: 'Masalah dalaman server' });
    }
});

/*  Route V&V (Verification & Validation)
*/
router.use('/', routerPengesahan);

/* PROTECTED ROUTEs AHEAD */
router.use(pengesahanToken);

/*  GET pelanggan

*/
router.get('/', async (req, res) => {
    try {
        // Dapatkan id pengelola
        const { pengelola } = req.muatanToken;

        // Mendapatkan keseluruhan maklumat pengelola
        const maklumatpengelola = await Pengelola.findById(pengelola, '-validasi');

        return res.status(200).json(maklumatpengelola);
    } catch (err) {
        // Ralat berlaku
        console.log(err);
        res.status(500).send({ mesej: 'Masalah dalaman server' });
    }
});

/*  PUT (kemas kini) pelanggan

*/
router.put('/kemas_kini', async (req, res) => {
    try {
        const { pengelola: _id } = req.muatanToken;

        // Mencari pengelola
        const pengelola = await Pengelola.findById(_id, 'namaAkaun namaPenuh').populate('validasi', 'katalaluan');

        const { namaAkaun, namaPenuh, katalaluanLama, katalaluanBaharu } = req.body;

        const { validasi } = pengelola;
        // Jika pengelola ingin mengemaskini KATA LALUAN...
        // Menguji jika parameter kata laluan lama diberi
        if (katalaluanBaharu) {

            // Memastikan kesahan kata laluan lama
            if (!(katalaluanLama && await bcrypt.compare(katalaluanLama, validasi.katalaluan))) {
                return res.status(400).send({ mesej: 'Katalaluan lama tidak benar' });
            }

            // Menyulitkan kata laluan
            const katalaluanDisulit = await bcrypt.hash(katalaluanBaharu, 10);

            // Mengemaskini kata laluan pengelola
            validasi.katalaluan = katalaluanDisulit;
            validasi.save();
        }

        // Mengemaskini nama pengelola
        pengelola.namaPenuh = namaPenuh || pengelola.namaPenuh;
        pengelola.namaAkaun = namaAkaun || pengelola.namaAkaun;

        // Menyimpan maklumat dalam pangkalan data
        pengelola.save();

        res.status(200).send(pengelola);

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

    const { validasi: _id } = req.muatanToken;

    // Mencari validasi pengelola
    const validasi = await Validasi.findById(_id, 'refreshToken');

    // Menghapuskan semua akses refresh token
    validasi.refreshToken = [];

    validasi.save();

    res.status(200).send({ mesej: 'Log keluar berjaya' });
});

// Mengeksport router untuk digunakan oleh aplikasi
module.exports = router;