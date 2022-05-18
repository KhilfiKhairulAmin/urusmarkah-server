const express = require('express');
const pengesahanPertandingan = require('../middleware/pengesahanPertandingan');
const Pertandingan = require('../model/Pertandingan');
const Peserta = require('../model/Peserta');
const router = express.Router();

/**
 * Mengembalikan tarikh dalam format tttt-bb-hh
 * @param {Date} tarikh 
 * @returns {String} tttt-bb-hh
 */
const formatTarikh = (tarikh) => {
    const tttt = String(tarikh.getFullYear());
    const bb = String(tarikh.getMonth() + 1).padStart(2, '0');
    const hh = String(tarikh.getDate()).padStart(2, '0');

    return `${tttt}-${bb}-${hh}`;
}

router.post('/cipta', (req, res) => {
    try {
        const { nama_pertandingan } = req.body;

        // Memastikan nama pertandingan wujud
        if (!nama_pertandingan) {
            return res.status(400).send({ mesej: 'Perlukan nama pertandingan' });
        }
    
        const { deskripsi, maklumat_tambahan, konfigurasi } = req.body;

        // Mencipta pertandingan baharu
        const pertandingan = new Pertandingan({
            pengguna_id: req.pengguna._id,
            nama_pertandingan,
            deskripsi,
            maklumat_tambahan,
            konfigurasi,
            metadata: {
                tarikh_dibuat: formatTarikh(new Date())
            }
        });
        
        // Memastikan maklumat yang dimasukkan sesuai dengan skema pertandingan
        const error = pertandingan.validateSync();

        if (error) {
            console.log(error);
            return res.status(400).send({ mesej: 'Sila periksa semula maklumat yang diberi' });
        }

        // Menyimpan maklumat pertandingan dalam pangkalan data
        pertandingan.save();
    
        res.status(201).send(pertandingan);
    } catch (err) {
        console.log(err);
        return res.status(500).send({ mesej: 'Ralat dalaman server' });
    }
});

router.get('/', async (req, res) => {
    try {
        const { pengguna } = req;

        const pertandingan = await Pertandingan.find({ pengguna_id: pengguna._id }, 'nama_pertandingan deskripsi status metadata');
    
        res.status(200).send(pertandingan);

    } catch (err) {
        console.log(err);

        res.status(500).end();
    }
});

router.get('/:pertandingan_id', pengesahanPertandingan, (req, res) => {
    try {
        const { pertandingan } = req;

        // Mengembalikan pertandingan
        res.status(200).send(pertandingan);

    } catch (err) {
        console.log(err);

        res.status(500).end();
    }
});

router.put('/:pertandingan_id/kemas_kini', pengesahanPertandingan, (req, res) => {
    try {
        const { pertandingan } = req;
        const { nama_pertandingan } = req.body;
    
        // Memastikan nama pertandingan tidak kosong
        if (!nama_pertandingan) {
            return res.status(400).send({ mesej: 'Sila berikan nama pertandingan'});
        }
    
        const { deskripsi, maklumat_tambahan, konfigurasi } = req.body;
    
        // Mengemaskini nama pertandingan (dengan cara overwrite)
        pertandingan.nama_pertandingan = nama_pertandingan;

        // Mengemaskini maklumat lain pertandingan
        pertandingan.deskripsi = deskripsi ?? pertandingan.deskripsi;
        pertandingan.maklumat_tambahan = maklumat_tambahan ?? pertandingan.maklumat_tambahan;
        pertandingan.konfigurasi = konfigurasi ?? pertandingan.konfigurasi;
    
        // Memastikan maklumat yang dikemaskini sesuai dengan skema pertandigan
        const error = pertandingan.validateSync();
    
        if (error) {
            return res.status(400).send({ mesej: 'Sila periksa semula maklumat yang diberi' });
        }
    
        // Menyimpan maklumat pertandingan dalam pangkalan data
        pertandingan.save();
    
        res.status(200).send({ mesej: 'Kemaskini berjaya' });
    } catch (err) {
        console.log(err);
        res.status(500).end();
    }
});

router.delete('/:pertandingan_id/hapus', pengesahanPertandingan, async (req, res) => {
    const { pertandingan } = req;
    const { nama_pertandingan: pengesahan } = req.body;

    // Memastikan pengesahan diberi
    // Pengesahan ialah nama pertandingan yang hendak dihapuskan
    if (!pengesahan) {
        return res.status(403).send({ mesej: 'Sila berikan nama pertandingan' });
    }

    // Memastikan pengesahan yang diberi betul
    if (pengesahan !== pertandingan.nama_pertandingan) {
        return res.status(403).send({ mesej: 'Pertandingan tidak berjaya dihapuskan' });
    }

    // Menghapuskan maklumat pertandingan
    await pertandingan.deleteOne({ _id: pertandingan._id})
    .catch((err) => {
        console.log(err);
        return res.status(500).end();
    });

    // Menghapuskan maklumat peserta dalam pertandingan
    const { deletedCount: bilPesertaHapus } = await Peserta.deleteMany({ pertandingan_id: pertandingan._id });

    res.status(200).send({ mesej: `1 Pertandingan telah dihapuskan. ${bilPesertaHapus} Peserta telah dihapuskan` });
});

// Route peserta
const routePeserta = require('./peserta');
router.use('/:pertandingan_id/peserta', pengesahanPertandingan, routePeserta);

module.exports = router;