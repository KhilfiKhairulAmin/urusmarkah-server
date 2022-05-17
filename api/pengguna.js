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
const Pengguna = require('../model/Pengguna');


const Validasi = require('../model/Validasi');
/* POST cipta akaun pelanggan

*/
router.post('/daftar', async (req, res) => {
    try {
        // Dapatkan nilai input
        const { emel , nama, kata_laluan } = req.body;

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

        //const muatan = { _id: pengguna._id };

        // Mencipta token dan refresh token baharu
        // const token = janaTokenJWT(muatan, { secretEnvKey: 'TOKEN_KEY' })
        // const refreshToken = janaTokenJWT(muatan, { secretEnvKey: 'REFRESH_TOKEN_KEY' })

        // Mencipta validasi
        // const validasi = new Validasi ({
        //     pengguna_id: pengguna._id
        // });

        // Menyimpan maklumat dalam pangkalan data
        pengguna.save();
        
        // // Mengembalikan token
        // res.status(201).json({ token, refreshToken });
        res.redirect('./log_masuk', 307);

    } catch (err) {
        // Ralat berlaku
        console.log(err);
    }
});

/*  Route V&V (Verification & Validation)
*/
router.use('/', routerPengesahan);

router.use(pengesahanToken);

/*  GET semua pelanggan

*/
router.get('/semua', async (req, res) => {
    const koleksi = await Pengguna.find({});
    res.status(200).send(koleksi);
});

/*  GET pelanggan

*/
router.get('/', async (req, res) => {
    try {
        // Dapatkan params dan maklumat pengguna
        const { _id } = req.pengguna;

        // Mendapatkan keseluruhan maklumat pengguna
        const maklumatPengguna = await Pengguna.findById(_id);

        return res.status(200).json(maklumatPengguna);
    } catch (err) {
        // Ralat berlaku
        console.log(err);
    }
});


/*  PUT (kemas kini) pelanggan

*/
router.put('/kemas_kini', async (req, res) => {
    try {
        const { _id } = req.pengguna;

        // Mencari pengguna
        const pengguna = await Pengguna.findById({ _id });

        // Memastikan pengguna wujud
        if (!pengguna) {
            return res.status(403).send({ mesej: 'Pengguna tidak wujud' });
        }

        const { nama, kata_laluan_lama, kata_laluan_baharu } = req.body;

        // Jika pengguna ingin mengemaskini KATA LALUAN...
        // Menguji jika parameter kata laluan lama diberi
        if (kata_laluan_baharu) {

            // Memastikan kesahan kata laluan lama
            if (!(await bcrypt.compare(kata_laluan_lama ?? '', pengguna.kata_laluan))) {
                return res.status(400).send({ mesej: 'Kata laluan salah' });
            }

            // Menyulitkan kata laluan
            const kataLaluanDisulit = await bcrypt.hash(kata_laluan_baharu, 10);

            // Mengemaskini kata laluan pengguna
            pengguna.kata_laluan = kataLaluanDisulit;
        }

        // Memastikan nama diberikan
        if (!nama) {
            return res.status(400).send({ mesej: 'Nama diperlukan' });
        }

        // Mengemaskini nama pengguna
        pengguna.nama = nama;

        // Menyimpan maklumat dalam pangkalan data
        pengguna.save();

        res.status(400).send(pengguna)
    } catch (err) {
        console.log(err);
    }
});

router.post('/log_keluar', async (req, res) => {
    const validasi = await Validasi.findOne({ pengguna_id: req.pengguna._id });

    if (!validasi) {
        return res.status(403).send({ mesej: 'Pengguna tidak wujud' })
    }

    validasi.refresh_token = [];

    validasi.save();

    res.status(200).send({ mesej: 'Log keluar berjaya' });
});

// Mengeksport router untuk digunakan oleh aplikasi
module.exports = router;