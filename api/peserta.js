const express = require('express');
const pengesahanPeserta = require('../middleware/pengesahanPeserta');
const Peserta = require('../model/Peserta');
const router = express.Router();

router.post('/daftar', async (req, res) => {
    try {
        const { peserta: pesertaBaharu } = req.body;

        // Memastikan peserta diberikan
        if (!pesertaBaharu) {
            return res.status(400).send({ mesej: 'Sila berikan peserta' });
        }
    
        // Memastikan format betul
        if (!Array.isArray(pesertaBaharu)) {
            return res.status(400).send({ mesej: 'Sila letakkan peserta dalam Array' });
        }
    
        let i = 1;
        const cipta = [];
    
        for (const peserta of pesertaBaharu) {
            const { nama_peserta } = peserta

            // Memastikan nama peserta tidak kosong
            if (!nama_peserta) {
                return res.status(400).send({ mesej: `Sila masukkan nama peserta ${i}`});
            }
    
            i++;

            const { _id: pertandingan_id } = req.pertandingan;

            // Mencipta Array baharu untuk menapis ciri objek yang tidak berkaitan
            cipta.push({
                pertandingan_id,
                nama_peserta
            });
        }

        // Mencipta peserta-peserta baharu
        await Peserta.insertMany(cipta)
        .catch((err) => {
            console.log(err);
            return res.status(400).send({ mesej: 'Sila lengkapkan butiran peserta dengan betul' });
        })
    
        res.status(201).send({ mesej: 'Peserta-peserta berjaya didaftar' });
    } catch (err) {
        console.log(err);
        res.status(500).end();
    }
});

router.get('/', async (req, res) => {
    try {
        const { pertandingan } = req;

        // Cari semua peserta dalam pertandingan
        const semuaPeserta = await Peserta.find({ pertandingan_id: pertandingan._id });

        res.status(200).send(semuaPeserta);
    } catch (err) {
        console.log(err);
        res.status(500).end();
    }
});

router.get ('/:peserta_id', pengesahanPeserta, async (req, res) => {
    try {
        // Dapatkan peserta dengan id yang diberikan
        const { peserta } = req;
        
        return res.status(200).send(peserta);
    } catch (err) {
        console.log(err);
        res.status(500).end();
    }
});

router.put('/:peserta_id/kemas_kini', pengesahanPeserta, async (req, res) => {
    try {
        const { peserta } = req;
        const { nama_peserta } = req.body;

        // Memastikan nama peserta diberikan
        if (!nama_peserta) {
            return res.status(400).send({ mesej: 'Sila berikan nama peserta' });
        }

        // Mengemaskini nama peserta (dengan cara overwrite)
        peserta.nama_peserta = nama_peserta;

        // Menyimpan maklumat dalam pangkalan data
        peserta.save();

        res.status(200).send(peserta);
    } catch (err) {
        console.log(err);
        res.status(500).end();
    }
});

router.delete('/hapus', async (req, res) => {
    try {
        const { peserta_id } = req.body;
        
        // Memastikan id peserta diberikan
        if (!peserta_id) {
            res.status(400).send({ mesej: 'Sila berikan ID Peserta' });
        }

        // Memastikan maklumat peserta diletakkan dalam Array
        // Ini kerana aplikasi ini tidak menyokong hapus satu peserta, hanya hapus banyak dibenarkan
        if (!Array.isArray(peserta_id)) {
            return res.status(400).send({ mesej: 'Sila letakkan peserta dalam Array' });
        }

        let i = 1;

        for (const id of peserta_id) {

            // Memastikan id peserta diberikan
            if (!id) {
                return res.status(400).send({ mesej: `Sila letakkan ID Peserta pada peserta ${i}` });
            }

            // Memastikan format id peserta adalah string
            if (typeof id !== 'string') {
                return res.status(400).send({ mesej: `Sila letakkan ID dalam format string pada peserta ${i}` });
            }

            i++;
        }

        // Menghapuskan peserta berkenaan dalam pangkalan data
        const { deletedCount } = await Peserta.deleteMany({ _id: peserta_id });

        res.status(200).send({ mesej: `${deletedCount} peserta telah dihapuskan` });
    } catch (err) {
        console.log(err);
        res.status(500).end();
    }
});

module.exports = router;