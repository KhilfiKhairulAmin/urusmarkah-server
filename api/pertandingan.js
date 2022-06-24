const express = require('express');
const Markah = require('../model/Markah');
const Pertandingan = require('../model/Pertandingan');
const penjanaTarikhMasa = require('../util/janaTarikhMasa');
const router = express.Router();
const kendaliRalatMongoose = require('../util/kendaliRalatMongoose');
const Ralat = require('../util/Ralat');

router.post('/cipta', async (req, res) => {
    try {
        const { nama } = req.body;
        const { pengelola } = req.muatanToken;

        if (!nama || nama.length > 255) throw new Ralat('nama', 'Nama pertandingan mesti wujud dan tidak boleh melebihi 255 perkataan');

        // Mencipta pertandingan baharu
        const pertandingan = new Pertandingan({
            pengelola,
            nama,
            tarikhMasa: {
                cipta: new Date()
            }
        });

        // Menyimpan maklumat pertandingan dalam pangkalan data
        await pertandingan.save();

        res.status(201).send({ pertandingan: pertandingan._id });

    } catch (ralat) {
        kendaliRalatMongoose(res, ralat, 'Sila pastikan butiran pertandingan mengikut format');
    }
}); 

router.get('/', async (req, res) => {
    try {
        const { pengelola } = req.muatanToken;
        const { nama } = req.query;

        const query = { pengelola };

        if (nama) query.nama = { '$regex': nama, '$options':'i' };

        const semuaPertandingan = await Pertandingan.find(query, 'nama tarikhMasa status bilPeserta');
    
        res.status(200).send(semuaPertandingan);

    } catch (ralat) {
        kendaliRalatMongoose(res, ralat, 'Pertandingan tidak dijumpai');
    }
});

router.get('/:pertandingan', async (req, res) => {
    try {
        const { pertandingan: _id } = req.params;
        const { pengelola } = req.muatanToken;

        const pertandingan = await Pertandingan.findOne({ _id, pengelola }).populate('pengelola', '-validasi');

        if (!pertandingan) throw new Ralat('Pencarian', 'Pertandingan tidak wujud' );

        // Mengembalikan pertandingan
        res.status(200).send(pertandingan);

    } catch (ralat) {
        kendaliRalatMongoose(res, ralat, 'Pertandingan tidak dijumpai')
    }
});

router.put('/:pertandingan/kemas_kini', async (req, res) => {
    try {
        const { pertandingan: _id } = req.params;
        const { pengelola } = req.muatanToken;
        const { nama, deskripsi, tarikhPelaksanaan, syarat, sumber, hadPeserta } = req.body;

        const pertandingan = await Pertandingan.findOne({ _id, pengelola }, 'nama tentang');

        if (!pertandingan) throw new Ralat('Pencarian', 'Pertandingan tidak dijumpai');

        if (nama && nama.length > 255) throw new Ralat('nama', 'Nama pertandingan tidak boleh melebihi 255 perkataan');

        if (deskripsi && deskripsi.length > 511) throw new Ralat('deskripsi', 'Deskripsi pertandingan tidak boleh melebihi 511 perkataan');

        if (hadPeserta && hadPeserta < 1 && hadPeserta > 999) throw new Ralat('hadPeserta', 'Had Peserta mesti antara 1 - 999');

        if (syarat && !Array.isArray(syarat)) throw new Ralat('syarat', 'Syarat-syarat perlu diletakkan dalam Array');

        if (sumber && !Array.isArray(sumber)) throw new Ralat('sumber', 'Sumber-sumber perlu diletakkan dalam Array');

        syarat.forEach((s) => {
            if (!s) throw new Ralat('syarat', 'Syarat tidak boleh kosong')
        });

        sumber.forEach((s) => {
            if (!s.nama || !s.url) throw new Ralat('sumber.nama | sumber.url', 'Sumber tidak boleh kosong');
        });
        console.log(deskripsi)
        pertandingan.nama = nama || pertandingan.nama;
        pertandingan.tentang.deskripsi = (deskripsi === "") ? "" : pertandingan.tentang.deskripsi;
        pertandingan.tentang.tarikhPelaksanaan = (tarikhPelaksanaan && new Date(tarikhPelaksanaan)) || pertandingan.tentang.tarikhPelaksanaan;
        pertandingan.tentang.syarat = syarat || pertandingan.tentang.syarat;
        pertandingan.tentang.sumber = sumber || pertandingan.tentang.sumber;

        await pertandingan.save();

        res.status(200).send({ mesej: 'Pertandingan berjaya dikemaskini'});
    } catch (ralat) {
        kendaliRalatMongoose(res, ralat, 'Sila pastikan butiran tentang pertandingan mengikut format')
    }
});

router.delete('/:pertandingan/hapus', async (req, res) => {
    try {
        const { pertandingan: _id } = req.params;
        const { pengelola } = req.muatanToken;
        const { nama } = req.body;

        console.log(req.body)
    
        // Memastikan pengesahan diberi
        // Pengesahan ialah nama pertandingan yang hendak dihapuskan
        if (!nama) throw new Ralat('nama', 'Sila berikan nama pertandingan sebagai pengesahan');
    
        const pertandingan = await Pertandingan.findOne({ _id, pengelola }, 'nama');
    
        if (!pertandingan) throw new Ralat('Pencarian', 'Pertandingan tidak dijumpai');
    
        if (!nama) throw new Ralat('nama', 'Sila berikan nama pertandingan sebagai pengesahan');
    
        if (nama !== pertandingan.nama) throw new Ralat('Nama', 'Nama pertandingan tidak tepat. Pertandingan gagal dihapus.');
    
        const { deletedCount: hapus } = await Pertandingan.deleteOne({ _id });
    
        if (!hapus) throw new Ralat('Hapus', 'Pertandingan gagal dihapuskan');
    
        res.status(200).send({ mesej: 'Pertandingan berjaya dihapuskan'});
    } catch (ralat) {
        kendaliRalatMongoose(res, ralat, 'Sila pastikan butiran mengikut format betul')
    }
});

router.get('/:pertandingan/peserta', async (req, res) => {
    try {
        const { pertandingan } = req.params;

        const peserta = await Markah.find({ pertandingan }).populate('peserta', 'namaAkaun namaPenuh');

        res.status(200).send(peserta);
    } catch (ralat) {
        kendaliRalatMongoose(res, ralat, 'Peserta tidak dijumpai')
    }
});

router.get('/:pertandingan/peserta/:peserta', async (req, res) => {
    try {
        const { pertandingan, peserta: _id } = req.params;

        const peserta = await Markah.findOne({ pertandingan, peserta: _id }).populate('peserta', 'namaAkaun namaPenuh');

        if (!peserta) throw new Ralat('Pencarian', 'Peserta tidak dijumpai')

        res.status(200).send(peserta);
    } catch (ralat) {
        kendaliRalatMongoose(res, ralat, 'Peserta tidak dijumpai')
    }
});

module.exports = router;