const { hash, compare } = require('bcryptjs');
const express = require('express');
const pengesahanPeserta = require('../middleware/pengesahanPeserta');
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

router.put('/:peserta_id/kemas_kini', pengesahanPeserta, async (req, res) => {
    try {
        const { peserta } = req;
        const { nama_peserta } = req.body;

        // Memastikan nama peserta diberikan
        if (!nama_peserta) {
            return res.status(400).send({ mesej: 'Sila berikan nama peserta' });
        }

        // Mengemaskini nama peserta (dengan cara overwrite)
        peserta.nama_peserta = nama_peserta;

        // Menyimpan maklumat dalam pangkalan data
        peserta.save();

        res.status(200).send(peserta);
    } catch (err) {
        console.log(err);
        res.status(500).end();
    }
});

router.delete('/hapus', async (req, res) => {
    try {
        const { peserta_id } = req.body;
        
        // Memastikan id peserta diberikan
        if (!peserta_id) {
            res.status(400).send({ mesej: 'Sila berikan ID Peserta' });
        }

        // Memastikan maklumat peserta diletakkan dalam Array
        // Ini kerana aplikasi ini tidak menyokong hapus satu peserta, hanya hapus banyak dibenarkan
        if (!Array.isArray(peserta_id)) {
            return res.status(400).send({ mesej: 'Sila letakkan peserta dalam Array' });
        }

        let i = 1;

        for (const id of peserta_id) {

            // Memastikan id peserta diberikan
            if (!id) {
                return res.status(400).send({ mesej: `Sila letakkan ID Peserta pada peserta ${i}` });
            }

            // Memastikan format id peserta adalah string
            if (typeof id !== 'string') {
                return res.status(400).send({ mesej: `Sila letakkan ID dalam format string pada peserta ${i}` });
            }

            i++;
        }

        // Menghapuskan peserta berkenaan dalam pangkalan data
        const { deletedCount } = await Peserta.deleteMany({ _id: peserta_id });

        res.status(200).send({ mesej: `${deletedCount} peserta telah dihapuskan` });
    } catch (err) {
        console.log(err);
        res.status(500).end();
    }
});

module.exports = router;