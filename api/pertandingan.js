const express = require('express');
const Markah = require('../model/Markah');
const Pertandingan = require('../model/Pertandingan');
const Peserta = require('../model/Peserta');
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

router.post('/:pertandingan/cipta', async (req, res) => {
    try {
        const nama = req.body;
        const { pertandingan: pertandingan_id } = req.params;

        const pertandingan = await Pertandingan.findById(pertandingan_id, 'bilPeserta');

        if (!pertandingan) throw new Ralat('Pertandingan tidak wujud', 'Pertandingan tidak wujud');
    
        for (const n of nama) {
            const peserta = new Peserta({
                namaAkaun: `${n.toLowerCase()+new Date().getMilliseconds()}`,
                emel: `${new Date().getTime()}@urusmarkah`,
                namaPenuh: n
            });
            const markah = new Markah({
                peserta: peserta._id,
                pertandingan: pertandingan_id,
                markah: [],
                jumlah: 0
            });

            pertandingan.bilPeserta += 1;

            await peserta.save({ validateBeforeSave: false})
            await markah.save({ validateBeforeSave: false})
        }

        await pertandingan.save();
    
        return res.status(200).send({ mesej: 'Peserta-peserta berjaya didaftarkan'});
    } catch (ralat) {
        kendaliRalatMongoose(res, ralat, 'Ralat berlaku')
    }
})

router.get('/', async (req, res) => {
    try {
        const { pengelola } = req.muatanToken;
        const { nama, status } = req.query;

        const query = { pengelola };

        if (nama) query.nama = { '$regex': nama, '$options':'i' };
        if (status) query.status = parseInt(status);
        console.log(query);
        const semuaPertandingan = await Pertandingan.find(query, 'nama tarikhMasa status bilPeserta');

        semuaPertandingan.sort((a, b) => {
            let x = a.nama.toLowerCase();
            let y = b.nama.toLowerCase();
            if (x < y) {return -1;}
            if (x > y) {return 1;}
            return 0;
        });
    
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

        // if (deskripsi && deskripsi.length > 511) throw new Ralat('deskripsi', 'Deskripsi pertandingan tidak boleh melebihi 511 perkataan');

        if (hadPeserta && hadPeserta < 1 && hadPeserta > 999) throw new Ralat('hadPeserta', 'Had Peserta mesti antara 1 - 999');

        if (syarat && !Array.isArray(syarat)) throw new Ralat('syarat', 'Syarat-syarat perlu diletakkan dalam Array');

        if (sumber && !Array.isArray(sumber)) throw new Ralat('sumber', 'Sumber-sumber perlu diletakkan dalam Array');

        syarat.forEach((s) => {
            if (!s) throw new Ralat('syarat', 'Syarat tidak boleh kosong')
        });

        sumber.forEach((s) => {
            if (!s.nama || !s.url) throw new Ralat('sumber.nama | sumber.url', 'Sumber tidak boleh kosong');
        });

        pertandingan.nama = nama || pertandingan.nama;
        pertandingan.tentang.deskripsi = (deskripsi === "") ? deskripsi : (deskripsi) ? deskripsi : pertandingan.tentang.deskripsi;
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
    
        // Memastikan pengesahan diberi
        // Pengesahan ialah nama pertandingan yang hendak dihapuskan
        if (!nama) throw new Ralat('nama', 'Sila berikan nama pertandingan sebagai pengesahan');
    
        const pertandingan = await Pertandingan.findOne({ _id, pengelola }, 'nama');
    
        if (!pertandingan) throw new Ralat('Pencarian', 'Pertandingan tidak dijumpai');
    
        if (!nama) throw new Ralat('nama', 'Sila berikan nama pertandingan sebagai pengesahan');
    
        if (nama !== pertandingan.nama) throw new Ralat('Nama', 'Nama pertandingan tidak tepat. Pertandingan gagal dihapus.');
    
        const { deletedCount: hapus } = await Pertandingan.deleteOne({ _id });
    
        if (!hapus) throw new Ralat('Hapus', 'Pertandingan gagal dihapuskan');

        await Markah.deleteMany({ pertandingan: _id})
    
        res.status(200).send({ mesej: 'Pertandingan berjaya dihapuskan'});
    } catch (ralat) {
        kendaliRalatMongoose(res, ralat, 'Sila pastikan butiran mengikut format betul')
    }
});

router.get('/:pertandingan/peserta', async (req, res) => {
    try {
        const { pertandingan } = req.params;

        const peserta = await Markah.find({ pertandingan }).populate('peserta', 'namaAkaun namaPenuh emel');

        peserta.sort((a, b) => {
            let x = a.peserta.namaPenuh.toLowerCase();
            let y = b.peserta.namaPenuh.toLowerCase();
            if (x < y) {return -1;}
            if (x > y) {return 1;}
            return 0;
        });

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

router.delete('/:pertandingan/peserta/:peserta/hapus', async (req, res) => {
    try {
        const { pertandingan, peserta: _id } = req.params;

        const peserta = await Markah.findOne({ pertandingan, peserta: _id }).populate('peserta', 'noKP bilPeserta').populate('pertandingan', 'bilPeserta');

        if (!peserta) throw new Ralat('Pencarian', 'Peserta tidak dijumpai')

        await Markah.deleteOne({ pertandingan, peserta: _id });
        
        // Menguji jika pengguna adalah dijana oleh sistem dan tidak berdaftar
        const noKPwujud = peserta.peserta.noKP;
        
        // Hapus data peserta yang dijana oleh sistem
        if (!noKPwujud) await Peserta.deleteOne({ _id });

        peserta.pertandingan.bilPeserta -= 1;

        await peserta.pertandingan.save()

        res.status(200).send({ mesej: 'Pertandingan berjaya dihapuskan'});

    } catch (ralat) {
        kendaliRalatMongoose(res, ralat, 'Peserta tidak dijumpai')
    }
});

module.exports = router;