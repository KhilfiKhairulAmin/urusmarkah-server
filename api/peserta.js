const { hash, compare } = require('bcryptjs');
const express = require('express');
const Peserta = require('../model/Peserta');
const Session = require('../model/Session');
const router = express.Router();
const pengesahanSession = require('../middleware/pengesahanSession');

router.post('/daftar', async (req, res) => {
    try {
        const { emel, namaAkaun, namaPenuh, noKP, katalaluan } = req.body;

        if (!(emel && namaAkaun && namaPenuh && noKP && katalaluan)) {
            return res.status(400).send({ mesej: 'Sila lengkapkan maklumat anda'});
        }

        if (noKP.length !== 12) {
            return res.status(400).send({ mesej: 'Nombor Kad Pengenalan tidak sah' });
        }

        const emelDigunakan = await Peserta.findOne({ emel });

        if (emelDigunakan) {
            return res.status(400).send({ mesej: 'Emel sudah digunakan'});
        }

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

        peserta.save();
        session.save();

        res.status(201).send({ session: session._id });

    } catch (err) {
        console.log(err);
        res.status(500).end();
    }
});

router.post('/log_masuk', async (req, res) => {
    try {
        const { emel, katalaluan } = req.body;

        if (!(emel && katalaluan)) {
            return res.status(400).send({ mesej: 'Sila lengkapkan maklumat anda'});
        }
    
        const peserta = await Peserta.findOne({ emel }, 'katalaluan');
    
        if (!(peserta && (await compare(katalaluan, peserta.katalaluan)))) {
            return res.status(400).send({ mesej: 'Emel atau katalaluan salah'});
        }
    
        await Session.deleteOne({ peserta: peserta._id });
    
        const session = new Session({
            peserta: peserta._id
        });
    
        session.save();
    
        res.status(200).send({ session: session._id });
        
    } catch (err) {
        if (err) return res.status(500).send({ mesej: 'Masalah dalaman server'});
    }
});

router.use(pengesahanSession);

router.get('/', async (req, res) => {
    try {
        const { peserta } = req;

        res.status(200).send(peserta);
    } catch (err) {
        console.log(err);
        res.status(500).end();
    }
});

router.put ('/kemas_kini', async (req, res) => {
    try {

        const { namaAkaun, namaPenuh, noKP, katalaluanLama, katalaluanBaharu } = req.body;
        const { peserta } = req;

        if (katalaluanBaharu) {
            if (!katalaluanLama) {
                return res.status(400).send({ mesej: 'Sila masukkan katalaluan lama'});
            }

            if(await compare(katalaluanLama, peserta.katalaluan)) {
                return res.status(400).send({ mesej: 'Katalaluan lama salah'});
            }

            const katalaluanDisulit = await hash(katalaluanBaharu, 10);

            peserta.katalaluan = katalaluanDisulit
        }

        if (noKP) {
            if (noKP.length !== 12) {
                return res.status(400).send({ mesej: 'Nombor Kad Pengenalan tidak sah'});
            }

            peserta.noKP = noKP;
        }

        peserta.namaAkaun = namaAkaun || peserta.namaAkaun;
        peserta.namaPenuh = namaPenuh || peserta.namaPenuh;

        peserta.save();

        res.status(200).send(peserta);

    } catch (err) {
        console.log(err);
        res.status(500).end();
    }
});

module.exports = router;