const { hash, compare } = require('bcryptjs');
const express = require('express');
const pengesahanPeserta = require('../middleware/pengesahanPeserta');
const Peserta = require('../model/Peserta');
const Session = require('../model/Session');
const router = express.Router();

router.post('/daftar', async (req, res) => {
    try {
        const { emel, namaAkaun, katalaluan, namaPenuh, noKP } = req.body;

        // Memastikan peserta diberikan
        if (!(emel && namaPenuh && katalaluan && namaAkaun && noKP)) {
            return res.status(400).send({ mesej: 'Sila lengkapkan maklumat anda' });
        }

        if (noKP.length !== 12) {
            return res.status(400).send({ mesej: 'Sila berikan nombor Kad Pengenalan yang sah'});
        }

        const emelTerdaftar = await Peserta.findOne({ emel });

        if (emelTerdaftar) {
            return res.status(400).send({ mesej: 'Emel telah berdaftar' });
        }

        const katalaluanDisulit = await hash(katalaluan, 10);

        const peserta = new Peserta({
            emel,
            namaAkaun,
            katalaluan: katalaluanDisulit,
            namaPenuh,
            noKP
        });

        const session = new Session({
            peserta: peserta._id
        });

        peserta.save();
        session.save();

        res.status(200).send({ session: session._id });
        
    } catch (err) {
        console.log(err);
        res.status(500).end();
    }
});

router.post('/log_masuk', async (req, res) => {
    const { emel, katalaluan } = req.body;

    if (!(emel && katalaluan)) {
        return res.status(400).send({ mesej: 'Sila lengkapkan maklumat anda'})
    }

    const peserta = await Peserta.findOne({ emel }, 'katalaluan');

    if (!(peserta && (await compare(katalaluan, peserta.katalaluan)))) {
        return res.status(400).send({ mesej: 'Emel atau katalaluan tidak benar'});
    }

    const hapusSession = await Session.deleteMany({ peserta: peserta._id });

    const session = new Session({
        peserta: peserta._id
    });

    session.save();

    res.status(200).send({ session: session._id });
});

router.get('/', async (req, res) => {
    try {
        const { pertandingan } = req;

        // Cari semua peserta dalam pertandingan
        const semuaPeserta = await Peserta.find({ pertandingan_id: pertandingan._id });

        res.status(200).send(semuaPeserta);
    } catch (err) {
        console.log(err);
        res.status(500).end();
    }
});

router.get ('/:peserta_id', pengesahanPeserta, async (req, res) => {
    try {
        // Dapatkan peserta dengan id yang diberikan
        const { peserta } = req;
        
        return res.status(200).send(peserta);
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