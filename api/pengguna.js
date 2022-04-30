// Mengendalikan HTTP request
const express = require('express');
const router = express.Router();

// Menyediakan algoritma penyulitan
const bcrypt = require('bcryptjs');

// Model data pengguna
const Pengguna = require('../model/Pengguna');

// Mengendalikan kesahan dan kebenaran (authentication and authorization) pengguna
const pengesahan = require('../middleware/pengesahanToken')

// Import fungsi-fungsi kemudahan
const deleteUndefinedProps = require('../util/deleteUndefinedProps');

// Membuat hubungan dengan pangkalan data
require('../konfig/pangkalan_data').connect(); 

/*  GET semua pelanggan

*/
router.get('/semua', async (req, res) => {
    const koleksi = await Pengguna.find({});
    res.status(200).send(koleksi);
});

/*  GET pelanggan

*/
router.get('/maklumat_pengguna', pengesahan, async (req, res) => {
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

// Mengeksport router untuk digunakan oleh aplikasi
module.exports = router;