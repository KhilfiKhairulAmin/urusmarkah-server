const express = require('express');
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

module.exports = router;