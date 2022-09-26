const { hash, compare } = require('bcryptjs');
const express = require('express');
const Peserta = require('../model/Peserta');
const Session = require('../model/Session');
const router = express.Router();
const pengesahanSession = require('../middleware/pengesahanSession');
const kendaliRalatMongoose = require('../util/kendaliRalatMongoose');
const Ralat = require('../util/Ralat');
const { validasiEmel, validasiKatalaluan} = require('../util/validasiInput');
const Pertandingan = require('../model/Pertandingan');
const Markah = require('../model/Markah');

router.post('/daftar', async (req, res) => {
    try {
        const { emel: validE, namaAkaun, namaPenuh, noKP, katalaluan: validKl } = req.body;

        const emel = validasiEmel(validE);

        const emelDigunakan = await Peserta.findOne({ emel }, '_id');

        if (emelDigunakan) throw new Ralat('Emel', 'Emel sudah berdaftar');

        if (!noKP) throw new Ralat('noKP', 'Nombor Kad Pengenalan tidak boleh kosong');

        if (noKP.length !== 12) throw new Ralat('noKP', 'Nombor Kad Pengenalan mesti mengandungi tepat 12 digit nombor');

        if (namaPenuh.length > 120) throw new Ralat('namaPenuh', 'Nama penuh tidak boleh melebihi 120 huruf');

        if (namaAkaun.length > 40) throw new Ralat('namaAkaun', 'Nama akaun tidak boleh melebihi 40 huruf');

        const katalaluan = validasiKatalaluan(validKl);

        const katalaluanDisulit = await hash(katalaluan, 10);

        const peserta = new Peserta({
            emel,
            namaAkaun,
            namaPenuh,
            noKP,
            katalaluan: katalaluanDisulit,
            tarikhMasaDaftar: new Date()
        });

        const session = new Session({
            peserta: peserta._id
        });

        await peserta.save();
        await session.save();

        res.status(200).send({ session: session._id });

    } catch (ralat) {
        kendaliRalatMongoose(res, ralat, 'Sila pastikan butiran anda mengikut format yang betul');
    }
});

router.post('/log_masuk', async (req, res) => {
    try {
        const { emel: validE, katalaluan: validKl } = req.body;

        const emel = validasiEmel(validE);
        const katalaluan = validasiKatalaluan(validKl);
    
        const peserta = await Peserta.findOne({ emel }, 'katalaluan');
    
        if (!(peserta && (await compare(katalaluan, peserta.katalaluan)))) throw new Ralat('emel | katalaluan', 'Emel atau katalaluan salah');
    
        await Session.deleteOne({ peserta: peserta._id });
    
        const session = new Session({
            peserta: peserta._id
        });
    
        await session.save();
    
        res.status(200).send({ session: session._id });
        
    } catch (ralat) {
        kendaliRalatMongoose(res, ralat, 'Sila pastikan butiran anda mengikut format yang betul')
    }
});

router.use(pengesahanSession);

router.get('/', async (req, res) => {
    try {
        const { peserta } = req;

        res.status(200).send(peserta);
    } catch (ralat) {
        kendaliRalatMongoose(res, ralat, 'Peserta gagal dijumpai');
    }
});

router.put ('/kemas_kini', async (req, res) => {
    try {

        const { namaAkaun, namaPenuh, noKP, katalaluanLama, katalaluanBaharu } = req.body;
        const { peserta } = req;

        if (katalaluanBaharu) {
            validasiKatalaluan(katalaluanBaharu);

            if (!katalaluanLama) throw new Ralat('katalaluanLama', 'Sila berikan katalaluan lama untuk menetapkan katalaluan baharu');

            if(await compare(katalaluanLama, peserta.katalaluan)) throw new Ralat('katalaluanLama', 'Katalaluan lama salah');

            const katalaluanDisulit = await hash(katalaluanBaharu, 10);

            peserta.katalaluan = katalaluanDisulit
        }

        if (noKP && noKP.length !== 12) throw new Ralat('noKP', 'Nombor Kad Pengenalan mesti mengandungi tepat 12 digit nombor');

        if (namaPenuh && namaPenuh.length > 120) throw new Ralat('namaPenuh', 'Nama penuh tidak boleh melebihi 120 huruf');

        if (namaAkaun && namaAkaun.length > 40) throw new Ralat('namaAkaun', 'Nama akaun tidak boleh melebihi 40 huruf');

        peserta.noKP = noKP || peserta.noKP;
        peserta.namaAkaun = namaAkaun || peserta.namaAkaun;
        peserta.namaPenuh = namaPenuh || peserta.namaPenuh;

        await peserta.save();

        res.status(200).send(peserta);

    } catch (ralat) {
        kendaliRalatMongoose(res, ralat, 'Sila pastikan butiran anda mengikut format yang betul');
    }
});

router.put('/log_keluar', async (req, res) => {
    try {
        const { peserta } = req;

        const { deletedCount } = await Session.deleteOne({ peserta });

        if (!deletedCount) throw new Ralat('Gagal', 'Log keluar gagal');

        res.status(200).send({ mesej: 'Log Keluar berjaya'});

    } catch (ralat) {
        kendaliRalatMongoose(res, ralat, 'Sila pastikan butiran tepat');
    }
})

router.get('/pertandingan', async (req, res) => {
    try {
        const { peserta } = req;

        const pertandingan = await Markah.find({ peserta: peserta._id }, 'pertandingan').populate('pertandingan', 'pengelola nama tentang status');

        console.log(pertandingan)

        res.status(200).send(pertandingan);
    } catch (ralat) {
        kendaliRalatMongoose(res, ralat, 'Tiada pertandingan dimasuki');
    }
})

router.get('/pertandingan_terkini', async (req, res) => {
    try {
        const pertandingan = await Pertandingan.find({ status: 0 }, 'pengelola nama status bilPeserta').sort('bilPeserta').populate('pengelola', 'namaAkaun');

        console.log(pertandingan)

        res.status(200).send(pertandingan);
    } catch (ralat) {
        kendaliRalatMongoose(res, ralat, 'Tiada pertandingan terkini');
    }
});

router.get('/:pertandingan', async (req, res) => {
    try {
        const { pertandingan: _id } = req.params;
        const { peserta } = req;

        const pertandingan = await Pertandingan.findById(_id).populate('pengelola', 'namaAkaun');

        if (!pertandingan) throw new Ralat('Pencarian', 'Pertandingan tidak dijumpai');

        const markah = await Markah.findOne({ pertandingan: _id, peserta });

        const sudahSertai = markah ? true : false

        const obj = { ...pertandingan }

        res.status(200).send({ ...obj._doc, sudahSertai});
    } catch (ralat) {
        kendaliRalatMongoose(res, ralat, 'Sila pastikan butiran tepat');
    }
});

router.post('/:pertandingan/sertai', async (req, res) => {
    try {
        const { pertandingan: _id } = req.params;
        const { peserta } = req;

        const markahWujud = await Markah.findOne({ pertandingan: _id, peserta });

        if (markahWujud) throw new Ralat('Sudah Sertai', 'Anda sudah menyertai pertandingan ini');

        const pertandingan = await Pertandingan.findById(_id, 'bilPeserta');

        pertandingan.bilPeserta += 1;

        const markah = new Markah({
            pertandingan: _id,
            peserta
        });

        await pertandingan.save();
        await markah.save();

        res.status(200).send(markah);

    } catch (ralat) {
        kendaliRalatMongoose(res, ralat, 'Sila pastikan butiran tepat');
    }
});

router.post('/:pertandingan/keluar', async (req, res) => {
    try {
        const { pertandingan: _id } = req.params;
        const { peserta } = req;

        const markah = await Markah.findOneAndDelete({ pertandingan: _id, peserta }).populate('pertandingan');

        const pertandingan = await Pertandingan.findById(_id);

        pertandingan.bilPeserta -= 1;

        if (!markah) throw new Ralat('Pencarian', 'Penyertaan tidak dijumpai');

        await pertandingan.save();

        res.status(200).send({ mesej: 'Pengeluaran berjaya'});
    } catch (ralat) {
        kendaliRalatMongoose(res, ralat, 'Sila pastikan butiran tepat');
    }
});

router.get('/:pertandingan/peserta', async (req, res) => {
    try {

        const { pertandingan } = req.params;

        const peserta = await Markah.find({ pertandingan }).populate('peserta');

        peserta.sort((a, b) => {
            return b.jumlah - a.jumlah
        });

        res.status(200).send(peserta)
    } catch (ralat) {

    }
});

router.get('/:pertandingan/peserta/:peserta', async (req, res) => {
    try {

        const { pertandingan, peserta: _id } = req.params;

        const peserta = await Markah.findOne({ pertandingan, peserta: _id }, 'peserta').populate('peserta', 'namaPenuh namaAkaun');

        res.status(200).send(peserta);
    } catch (ralat) {

    }
});

module.exports = router; 