const express = require('express');
const Markah = require('../model/Markah');
const Pertandingan = require('../model/Pertandingan');
const kendaliRalatMongoose = require('../util/kendaliRalatMongoose');
const Ralat = require('../util/Ralat');
const router = express.Router();

router.put('/:pertandingan', async (req, res) => {
    try {
        const { pertandingan: _id } = req.params;
        const { pengelola } = req;
        const { urusmarkah } = req.body;

        const pertandingan = await Pertandingan.findOne({ pertandingan: _id, pengelola });

        if (!pertandingan) throw new Ralat('Pencarian', 'Pertandingan tidak wujud');

        const { markah, nilai } = urusmarkah;

        if (markah.length === nilai.length) throw new Ralat('urusmarkah.markah & urusmarkah.nilai', 'Bilangan item Array dalam markah dan nilai mesti sama');

        for (const n of nilai) {
            if (typeof n !== String || typeof n !== Number) throw new Ralat('nilai', 'Hanya jenis data String dan Number dibenarkah');

            if (typeof parseInt(n) === NaN) throw new Ralat('nilai', 'Nilai String mestilah menggunakan nombor');
        }

        const markahPeserta = [];

        // Mencari setiap data markah
        for (let i = 0; i < markah.length; i++) {

            const _id = markah[i];

            const urus = await Markah.findById(_id);
            
            if (!urus) throw new Ralat('urusmarkah.markah', `Markah ${_id} tidak wujud. Pengemaskinian markah gagal`);

            markahPeserta.push(urus);

            // Penambahan
            let tambah;
            if (typeof nilai[i] === String) {
                // Setter
                tambah = parseInt(nilai[i]);
                markahPeserta[i].jumlah = tambah;
            }
            else {
                // Operator
                tambah = nilai[i];
                markahPeserta[i].jumlah += tambah;
            }

            markahPeserta[i].markah.push(tambah);
        }

        // Menyimpan data markah yang dikemaskini
        for (const markah of markahPeserta) {
            await markah.save();
        }

        res.send(200).send(markahPeserta);
    } catch (ralat) {
        kendaliRalatMongoose(res, ralat, 'Sila pastikan butiran markah tepat');
    }

    
});

