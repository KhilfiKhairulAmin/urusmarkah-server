const express = require('express');
const pengesahanPertandingan = require('../middleware/pengesahanPertandingan');
const Pertandingan = require('../model/Pertandingan');
const router = express.Router();

const tarikhHariIni = () => {
    const tarikh = new Date();
    const tttt = String(tarikh.getFullYear());
    const bb = String(tarikh.getMonth() + 1).padStart(2, '0');
    const hh = String(tarikh.getDate()).padStart(2, '0');

    return `${tttt}-${bb}-${hh}`;
}

router.get('/:pertandingan_id', pengesahanPertandingan ,(req, res) => {
    const { pertandingan } = req;

    return res.status(200).send(pertandingan);
});

router.post('/cipta_pertandingan', (req, res) => {
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
                tarikh_dibuat: tarikhHariIni()
            }
        });
        
        const error = pertandingan.validateSync();

        if (error) {
            console.log(error);
            return res.status(400).send({ mesej: 'Periksa semula body request' });
        }

        pertandingan.save();
    
        res.status(201).send(pertandingan);
    } catch (err) {
        console.log(err);
        return res.status(500).send({ mesej: 'Ralat dalaman server' });
    }
});



module.exports = router;