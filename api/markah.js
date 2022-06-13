const express = require('express');
const router = express.Router();
const Ralat = require('../util/Ralat');
const Markah = require('../model/Markah');
const Pertandingan = require('../model/Pertandingan');
const kendaliRalatMongoose = require('../util/kendaliRalatMongoose');

router.post('/sertai', async (req, res) => {

    try {
        const { pertandingan: _id } = req.params;
        const { peserta } = req;
    
        const pertandingan = await Pertandingan.findById(_id, 'bilPeserta hadPeserta tarikhMasa');
    
        if (!pertandingan) throw new Ralat('pertandingan', 'Pertandingan tidak wujud');

        const markahWujud = await Markah.findOne({
            peserta,
            pertandingan: _id
        });
    
        if (markahWujud) throw new Ralat('Penyertaan', 'Anda sudah disertakan dalam pertandingan ini');

        const { tarikhMasa, bilPeserta, hadPeserta } = pertandingan;

        if (tarikhMasa.laksana) throw new Ralat('Penyertaan Ditutup', 'Pertandingan telah dijanlankan');

        if (bilPeserta + 1 > hadPeserta) throw new Ralat('Penyertaan Penuh', 'Pertandingan telah penuh');
    
        const markah = new Markah({
            peserta,
            pertandingan: _id
        });

        pertandingan.bilPeserta += 1;
    
        await markah.save();
        await pertandingan.save();

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
    }
});

router.delete('/keluar', async (req, res) => {
    try {

        const { pertandingan: _id } = req.params;
        const { peserta } = req;

        const markah = await Markah.findOne({ peserta, pertandingan: _id }, '-peserta -kedudukan -markah').populate('pertandingan', 'tarikhMasa bilPeserta');

        if (!markah) throw new Ralat('Keluar gagal', 'Anda tidak menyertai pertandingan ini');

        const { pertandingan } = markah;

        if (pertandingan.tarikhMasa.laksana) throw new Ralat('Pertandingan Sedang Dijalankan', 'Anda tidak boleh keluar semasa pertandingan dijalankan');

        pertandingan.bilPeserta -= 1;

        const { deletedCount: bilHapus } = await Markah.deleteOne({ _id: markah._id });

        if (!bilHapus) throw new Ralat('Keluar gagal', 'Pengeluaran gagal');

        await pertandingan.save()

        res.status(200).send({ mesej: 'Pengeluaran berjaya'})

    } catch (ralat) {
        kendaliRalatMongoose(res, ralat, 'Sila pastikan butiran diberikan betul');
    }
});

module.exports = router;