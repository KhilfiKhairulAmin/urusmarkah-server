const { hash, compare } = require('bcryptjs');
const express = require('express');
const Peserta = require('../model/Peserta');
const Session = require('../model/Session');
const router = express.Router();
const pengesahanSession = require('../middleware/pengesahanSession');
const kendaliRalatMongoose = require('../util/kendaliRalatMongoose');
const Ralat = require('../util/Ralat');
const {validasiEmel, validasiKatalaluan} = require('../util/validasiInput');

router.post('/daftar', async (req, res) => {
    try {
        const { emel: validE, namaAkaun, namaPenuh, noKP, katalaluan: validKl } = req.body;

        const emel = validasiEmel(validE);

        const emelDigunakan = await Peserta.findOne({ emel }, '_id');

        if (emelDigunakan) throw new Ralat('Emel', 'Emel sudah berdaftar');

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
            tarikhMasaDaftar: new Date().toLocaleString()
        });

        const session = new Session({
            peserta: peserta._id
        });

        await peserta.save();
        await session.save();

        res.status(201).send({ session: session._id });

    } catch (ralat) {
        console.log(ralat);
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

module.exports = router;