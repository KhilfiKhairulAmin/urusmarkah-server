const express = require('express');
const Pengiraan = require('../model/Pengiraan');
const Pertandingan = require('../model/Pertandingan');
const penjanaTarikhMasa = require('../util/janaTarikhMasa');
const router = express.Router();
const kendaliRalatMongoose = require('../util/kendaliRalatMongoose');
const Ralat = require('../util/Ralat');

router.post('/cipta', async (req, res) => {
    try {
        const { nama, pengiraan, hadPeserta } = req.body;
        const { pengelola } = req.muatanToken;

        const pengiraanWujud = await Pengiraan.findOne({ noRujukan: pengiraan }, '_id');

        if (!pengiraanWujud) throw new Ralat('pengiraan', 'Jenis Pengiraan tidak wujud');

        if (!nama || nama.length > 255) throw new Ralat('nama', 'Nama pertandingan mesti wujud dan tidak boleh melebihi 255 perkataan');

        // Mencipta pertandingan baharu
        const pertandingan = new Pertandingan({
            pengelola,
            nama,
            pengiraan: pengiraanWujud._id,
            tarikhMasa: {
                cipta: penjanaTarikhMasa()
            },
            hadPeserta: hadPeserta || 999
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

        const semuaPertandingan = await Pertandingan.find({ pengelola }, 'nama tarikhMasa');
    
        res.status(200).send(semuaPertandingan);

    } catch (ralat) {
        kendaliRalatMongoose(res, ralat, 'Pertandingan tidak dijumpai');
    }
});

router.get('/:pertandingan', async (req, res) => {
    try {
        const { pertandingan: _id } = req.params;
        const { pengelola } = req.muatanToken;

        const pertandingan = await Pertandingan.findOne({ _id, pengelola }, '-pengelola -_id').populate('pengiraan', '-_id');

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
        const { nama, deskripsi, tarikhPelaksanaan, syarat, sumber } = req.body;

        const pertandingan = await Pertandingan.findOne({ _id, pengelola }, 'nama tentang');

        if (!pertandingan) throw new Ralat('Pencarian', 'Pertandingan tidak dijumpai');

        if (nama && nama.length > 255) throw new Ralat('nama', 'Nama pertandingan tidak boleh melebihi 255 perkataan');

        if (deskripsi && deskripsi.length > 511) throw new Ralat('deskripsi', 'Deskripsi pertandingan tidak boleh melebihi 511 perkataan');

        if (syarat && !Array.isArray(syarat)) throw new Ralat('syarat', 'Syarat-syarat perlu diletakkan dalam Array')

        if (sumber && !Array.isArray(sumber)) throw new Ralat('sumber', 'Sumber-sumber perlu diletakkan dalam Array')

        const { tentang } = pertandingan;

        tentang.deskripsi = deskripsi || tentang.deskripsi;
        tentang.tarikhPelaksanaan = tarikhPelaksanaan || tentang.tarikhPelaksanaan;
        tentang.syarat = syarat || tentang.syarat;
        tentang.sumber = sumber || tentang.sumber;

        await pertandingan.save();

        res.status(200).send({ mesej: 'Pertandingan berjaya dikemaskini'});
    } catch (ralat) {
        kendaliRalatMongoose(res, ralat, 'Sila pastikan butiran tentang pertandingan mengikut format')
    }
});

router.put('/:pertandingan/format', async (req, res) => {
    try {
        const { pertandingan: _id } = req.params;
        const { pengelola } = req;
        const { kriteria } = req.body
    
        const pertandingan = await Pertandingan.findOne({ pertandingan: _id, pengelola }).populate('pengiraan', 'noRujukan');
    
        if (!pertandingan) throw new Ralat('Pencarian', 'Pertandingan tidak wujud');
    
        const { pengiraan } = pertandingan;

        let format;
    
        switch (pengiraan.noRujukan) {
            // Penambahan
            case 1: {
                format = { markah: [], kedudukan: [] };
                break;
            }
            // Penambahan tetap
            case 2: {
                format = { markah: [], keudukan: [] };
                break
            }
            default: {
                throw new Ralat('Pengiraan', 'Jenis pengiraan tidak wujud');
            }
        }

        pertandingan.format = format;
    
        await pertandingan.save();

        res.status(200).send({ mesej: 'Pertandingan berjaya diformat'});
    } catch (ralat) {
        kendaliRalatMongoose(res, ralat, 'Sila pastikan butiran anda lengkap dan betul');
    }
});

router.delete('/:pertandingan/hapus', async (req, res) => {
    try {
        const { pertandingan: _id } = req.params;
        const { pengelola } = req.muatanToken;
        const { nama } = req.body;
    
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

module.exports = router;