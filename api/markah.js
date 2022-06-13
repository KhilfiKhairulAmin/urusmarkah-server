const express = require('express');
const router = express.Router();
const Ralat = require('../util/Ralat');
const Markah = require('../model/Markah');
const Pertandingan = require('../model/Pertandingan');

router.post('/sertai', async (req, res) => {

    try {
        const { pertandingan: _id } = req.params;
        const { peserta } = req;
    
        const pertandingan = await Pertandingan.findById(_id);
    
<<<<<<< HEAD
        if (!pertandingan) throw new Ralat('Pencarian', 'Pertandingan tidak dijumpai');

        const { tarikhMasa } = pertandingan;

        if (tarikhMasa.laksana) throw new Ralat('Pelaksanaan', 'Pertandingan gagal disertai kerana telah dimulakan');


    } catch (ralat) {

=======
        if (!pertandingan) throw new Ralat('pertandingan', 'Pertandingan tidak wujud');
    
        const markahWujud = await Markah.findOne({
            peserta,
            pertandingan: _id
        });
    
        if (markahWujud) throw new Ralat('Penyertaan', 'Anda sudah disertakan dalam pertandingan ini');
    
        const markah = new Markah({
            peserta,
            pertandingan: _id
        });
    
        await markah.save();

        res.status(201).send({ mesej: 'Penyertaan berjaya'});
    } catch (ralat) {
        kendaliRalatMongoose(res, ralat, 'Sila pastikan butiran yang diberikan betul');
    }
});

router.get('/markah', async (req, res) => {
    try {
        const { pertandingan } = req.params;
        const { peserta } = req;

        const markah = await Markah.findOne({ pertandingan, peserta }, 'markah kedudukan');

        if (!markah) throw new Ralat('Penyertaan', 'Anda tidak menyertai pertandingan ini');

        res.status(200).send(markah);
    } catch (ralat) {
        kendaliRalatMongoose(res, ralat, 'Sila pastikan butiran yang diberikan betul');
>>>>>>> b9c71a88e59edbd01eac65934428934f7482ba23
    }
});

module.exports = router;