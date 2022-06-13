const express = require('express');
const Markah = require('../model/Markah');
const Pertandingan = require('../model/Pertandingan');
const Ralat = require('../util/Ralat');
const router = express.Router();

router.put('/:pertandingan', async (req, res) => {

    const { pertandingan: _id } = req.params;
    const { pengelola } = req;
    const { urusmarkah } = req.body;

    const pertandingan = await Pertandingan.findOne({ pertandingan: _id, pengelola });

    if (!pertandingan) throw new Ralat('Pencarian', 'Pertandingan tidak wujud');

    const { markah, nilai } = urusmarkah;

    if (markah.length === nilai.length) throw new Ralat('urusmarkah.markah & urusmarkah.nilai', 'Bilangan item Array dalam markah dan nilai mesti sama');

    const markahPeserta = [];

    // Mencari setiap data markah
    for (let i = 0; i < markah.length; i++) {

        const _id = markah[i];

        const urus = await Markah.findById(_id, 'markah');
        
        if (!urus) throw new Ralat('urusmarkah.markah', `Markah ${_id} tidak wujud. Pengemaskinian markah gagal.`);

        markahPeserta.push(urus);
    }

    

    // Menyimpan data markah yang dikemaskini
    for (const markah of markahPeserta) {
        await markah.save();
    }
});

