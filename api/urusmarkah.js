const express = require('express');
const Markah = require('../model/Markah');
const Pertandingan = require('../model/Pertandingan');
const kendaliRalatMongoose = require('../util/kendaliRalatMongoose');
const Ralat = require('../util/Ralat');
const router = express.Router();

router.put('/laksana/:pertandingan', async (req, res) => {
    try {
        const { pertandingan: _id } = req.params;
    
        const pertandingan = await Pertandingan.findById(_id, 'format status tentang.tarikhPelaksanaan');

        if (!pertandingan) throw new Ralat('Pencarian', 'Pertandingan tidak dijumpai');
        
        pertandingan.status = 1;
    
        const peserta = await Markah.find({ pertandingan: _id }, 'urusmarkah');
    
        for (const p of peserta) {
            p.urusmarkah = pertandingan.format;
    
            await p.save();
        }
        let tarikh_baru = new Date();
        pertandingan.tarikhMasa.laksana = tarikh_baru;
        pertandingan.tentang.tarikhPelaksanaan = tarikh_baru;
        
        pertandingan.save();

        res.status(200).send({ mesej: 'Pertandingan berjaya dilaksanakan'});
    } catch (ralat) {
        kendaliRalatMongoose(res, ralat, 'Sila periksa butiran anda')
    }
});

router.delete('/tamat/:pertandingan', async (req, res) => {
    try {
        const { pertandingan: _id } = req.params;
    
        const pertandingan = await Pertandingan.findById(_id, 'format status');

        if (!pertandingan) throw new Ralat('Pencarian', 'Pertandingan tidak dijumpai');
        
        pertandingan.status = 2;
        pertandingan.tarikhMasa.tamat = new Date();
        
        pertandingan.save();

        res.status(200).send({ mesej: 'Pertandingan berjaya ditamatkan'});
    } catch (ralat) {
        kendaliRalatMongoose(res, ralat, 'Sila periksa butiran anda')
    }
});

router.get('/keputusan/:pertandingan', async (req, res) => {
    try {
        const { pertandingan: _id } = req.params;

        const markah = await Markah.find({ pertandingan: _id }).populate('peserta');

        markah.sort((a, b) => {
            return b.jumlah - a.jumlah
        });

        res.status(200).send(markah)

    } catch (ralat) {
        kendaliRalatMongoose(res, ralat, 'Ralat berlaku')
    }
})

router.put('/:pertandingan', async (req, res) => {
    try {
        const { pertandingan: _id } = req.params;
        const { pengelola } = req.muatanToken;
        const { markah, nilai } = req.body;

        const pertandingan = await Pertandingan.findOne({ pertandingan: _id, pengelola });

        if (!pertandingan) throw new Ralat('Pencarian', 'Pertandingan tidak wujud');

        if (markah.length !== nilai.length) throw new Ralat('urusmarkah.markah & urusmarkah.nilai', 'Bilangan item Array dalam markah dan nilai mesti sama');

        const markahPeserta = [];

        // Mencari setiap data markah
        for (let i = 0; i < markah.length; i++) {

            const _id = markah[i];

            const urus = await Markah.findById(_id);
            
            if (!urus) throw new Ralat('urusmarkah.markah', `Markah ${_id} tidak wujud. Pengemaskinian markah gagal`);

            // Penambahan
            let tambah;
            tambah = parseFloat(nilai[i]);
            urus.jumlah = urus.jumlah + tambah;
            urus.markah.push(tambah);

            await urus.save()
        }

        const markahTerkini = await Markah.find({ pengelola, pertandingan: _id }).populate('peserta');

        markahTerkini.sort((a, b) => {
            return b.jumlah - a.jumlah
        });

        res.status(200).send(markahTerkini);

    } catch (ralat) {
        kendaliRalatMongoose(res, ralat, 'Sila pastikan butiran markah tepat');
    } 
});

module.exports = router;