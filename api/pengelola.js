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
const Ralat = require('../util/Ralat');
const kendaliRalatMongoose = require('../util/kendaliRalatMongoose');
const { validasiEmel, validasiKatalaluan } = require('../util/validasiInput');

/* POST cipta akaun pelanggan

*/
router.post('/daftar', async (req, res) => {
    try {
        // Dapatkan nilai input
        const { emel, namaAkaun, namaPenuh, katalaluan } = req.body;

        // Memastikan nilai tidak kosong
        if (!emel) throw new Ralat('emel', 'Sila berikan emel');

        validasiEmel(emel);

        if (!katalaluan) throw new Ralat('katalaluan', 'Sila berikan katalaluan');

        validasiKatalaluan(katalaluan);

        if (namaAkaun.length > 40) throw new Ralat('namaAkaun', 'Nama Akaun tidak boleh melebihi 40 huruf');

        if (namaPenuh.length > 255) throw new Ralat('namaPenuh', 'Nama penuh tidak boleh melebihi 255 huruf');

        // Memastikan emel belum diambil oleh pengelola lain
        const pengelolaLama = await Pengelola.findOne({ emel });

        if (pengelolaLama) throw new Ralat('emel', 'Emel sudah berdaftar');

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
        const token = janaTokenJWT(muatan, { secretEnvKey: 'TOKEN_KEY', expiresIn: process.env.MASA });

        // Membuat refresh token baharu
        const refreshToken = janaTokenJWT(muatan, { secretEnvKey: 'REFRESH_TOKEN_KEY' });

        validasi.refreshToken = [refreshToken]

        await validasi.save();
        await pengelola.save();

        res.status(200).send({ token, refreshToken });

    } catch (ralat) {
        kendaliRalatMongoose(res, ralat, 'Sila pastikan butiran lengkap');
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
    } catch (ralat) {
        kendaliRalatMongoose(res, ralat, 'Sila pastikan butiran betul');
    }
});

/*  PUT (kemas kini) pelanggan

*/
router.put('/kemas_kini', async (req, res) => {
    try {
        const { pengelola: _id } = req.muatanToken;

        // Mencari pengelola
        const pengelola = await Pengelola.findById(_id, 'namaAkaun namaPenuh').populate('validasi', 'katalaluan');

        if (!pengelola) throw new Ralat('Pencarian', 'Pengelola tidak dijumpai');

        const { namaAkaun, namaPenuh, katalaluanLama, katalaluanBaharu } = req.body;

        const { validasi } = pengelola;
        // Jika pengelola ingin mengemaskini KATA LALUAN...
        // Menguji jika parameter kata laluan lama diberi
        if (katalaluanBaharu) {

            // Memastikan kesahan kata laluan lama
            if (!(katalaluanLama && await bcrypt.compare(katalaluanLama, validasi.katalaluan))) throw new Ralat('katalaluan', 'Katalaluan tidak benar');

            // Menyulitkan kata laluan
            const katalaluanDisulit = await bcrypt.hash(katalaluanBaharu, 10);

            // Mengemaskini kata laluan pengelola
            validasi.katalaluan = katalaluanDisulit;
            await validasi.save();
        }

        // Mengemaskini nama pengelola
        pengelola.namaPenuh = namaPenuh || pengelola.namaPenuh;
        pengelola.namaAkaun = namaAkaun || pengelola.namaAkaun;

        // Menyimpan maklumat dalam pangkalan data
        await pengelola.save();

        res.status(200).send(pengelola);

    } catch (ralat) {
        kendaliRalatMongoose(res, ralat, 'Sila pastikan maklumat diberikan dengan tepat');
    }
});

router.get('/validasi', (req, res) => {
    res.status(200).send({ sah: true });
});

/* POST log keluar
*/
router.put('/log_keluar', async (req, res) => {
    try {
        const { validasi: _id } = req.muatanToken;

        // Mencari validasi pengelola
        const validasi = await Validasi.findById(_id, 'refreshToken');
    
        // Menghapuskan semua akses refresh token
        validasi.refreshToken = [];
    
        validasi.save();
    
        res.status(200).send({ mesej: 'Log keluar berjaya' });
    } catch (ralat) {
        kendaliRalatMongoose(res, ralat, 'Ralat tidak diketahui berlaku');
    }
});

// Mengeksport router untuk digunakan oleh aplikasi
module.exports = router;