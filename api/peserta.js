const express = require('express');
const pengesahanPeserta = require('../middleware/pengesahanPeserta');
const Peserta = require('../model/Peserta');
const router = express.Router();

router.post('/daftar', async (req, res) => {
    try {
        const { peserta: pesertaBaharu } = req.body;

        if (!pesertaBaharu) {
            return res.status(400).send({ mesej: 'Sila berikan peserta' });
        }
    
        if (!Array.isArray(pesertaBaharu)) {
            return res.status(400).send({ mesej: 'Sila letakkan peserta dalam Array' });
        }
    
        let i = 1;
    
        for (const peserta of pesertaBaharu) {
            if (!peserta.nama_peserta) {
                return res.status(400).send({ mesej: `Sila masukkan nama peserta ${i}`});
            }
    
            i++;

            peserta.pertandingan_id = req.pertandingan._id;
        }

        await Peserta.insertMany(pesertaBaharu)
        .catch((err) => {
            console.log(err);
            return res.status(400).send({ mesej: 'Sila lengkapkan butiran anda dengan betul' });
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

        const semuaPeserta = await Peserta.find({ pertandingan_id: pertandingan._id });

        res.status(200).send(semuaPeserta);
    } catch (err) {
        console.log(err);
        res.status(500).end();
    }
});

router.get ('/:peserta_id', pengesahanPeserta, async (req, res) => {
    try {
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

        if (!nama_peserta) {
            return res.status(400).send({ mesej: 'Sila berikan nama peserta' });
        }

        peserta.nama_peserta = nama_peserta;

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
        
        if (!peserta_id) {
            res.status(400).send({ mesej: 'Sila berikan ID Peserta' });
        }

        if (!Array.isArray(peserta_id)) {
            return res.status(400).send({ mesej: 'Sila letakkan peserta dalam Array' });
        }

        let i = 1;

        for (const id of peserta_id) {

            if (!id) {
                return res.status(400).send({ mesej: `Sila letakkan ID Peserta pada peserta ${i}` });
            }

            if (typeof id !== 'string') {
                return res.status(400).send({ mesej: `Sila letakkan ID dalam format string pada peserta ${i}` });
            }

            i++;
        }

        const { deletedCount } = await Peserta.deleteMany({ _id: peserta_id });

        res.status(200).send({ mesej: `${deletedCount} peserta telah dihapuskan` });
    } catch (err) {
        console.log(err);
        res.status(500).end();
    }
});


module.exports = router;