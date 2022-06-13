const express = require('express');
const Pertandingan = require('../model/Pertandingan');
const Ralat = require('../util/Ralat');
const router = express.Router();

router.post(':pertandingan/sertai', async (req, res) => {
    try {
        const { pertandingan: _id } = req.params;
        const { peserta } = req;
    
        const pertandingan = await Pertandingan.findById(_id);
    
        if (!pertandingan) throw new Ralat('Pencarian', 'Pertandingan tidak dijumpai');

        const { tarikhMasa } = pertandingan;

        if (tarikhMasa.laksana) throw new Ralat('Pelaksanaan', 'Pertandingan gagal disertai kerana telah dimulakan');


    } catch (ralat) {

    }
});

module.exports = router;