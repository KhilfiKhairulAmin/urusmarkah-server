const express = require('express');
const pengesahanPertandingan = require('../middleware/pengesahanPertandingan');
const Pertandingan = require('../model/Pertandingan');
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
        
        const error = pertandingan.validateSync();

        if (error) {
            console.log(error);
            return res.status(400).send({ mesej: 'Sila periksa semula maklumat yang diberi' });
        }

        pertandingan.save();
    
        res.status(201).send(pertandingan);
    } catch (err) {
        console.log(err);
        return res.status(500).send({ mesej: 'Ralat dalaman server' });
    }
});

router.get('/:pertandingan_id', pengesahanPertandingan, (req, res) => {
    try {
        const { pertandingan } = req;

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
    
        if (!nama_pertandingan) {
            return res.status(400).send({ mesej: 'Sila berikan nama pertandingan'});
        }
    
        const { deskripsi, maklumat_tambahan, konfigurasi } = req.body;
    
        pertandingan.nama_pertandingan = nama_pertandingan;
        pertandingan.deskripsi = deskripsi ? deskripsi : pertandingan.deskripsi;
        pertandingan.maklumat_tambahan = maklumat_tambahan ? maklumat_tambahan : pertandingan.maklumat_tambahan;
        pertandingan.konfigurasi = konfigurasi ? konfigurasi : pertandingan.konfigurasi;
    
        const error = pertandingan.validateSync();
    
        if (error) {
            return res.status(400).send({ mesej: 'Sila periksa semula maklumat yang diberi' });
        }
    
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
    if (!pengesahan) {
        return res.status(403).send({ mesej: 'Sila berikan nama pertandingan' });
    }

    // Memastikan pengesahan yang diberi betul
    if (pengesahan !== pertandingan.nama_pertandingan) {
        return res.status(403).send({ mesej: 'Pertandingan tidak berjaya dihapuskan' });
    }

    await pertandingan.deleteOne({ _id: pertandingan._id})

    res.status(200).end()
})

module.exports = router;