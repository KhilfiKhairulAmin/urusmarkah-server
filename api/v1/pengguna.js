const express = require('express'); // Modul Express digunakan untuk mencipta server HTTP dan API
const Pengguna = require('../../model/Pengguna'); // Modul Mongoose digunakan untuk menggunakan pangkalan data MongoDB
require('../../konfig/pangkalan_data').connect();
const cookieParser = require('cookie-parser');

const crypto = require('crypto');

const router = express.Router(); // Router Express digunakan untuk mengendalikan laluan pesanan (request route) oleh pengguna

const janaIdSession = (kunci_unik) => {
    const random = crypto.randomInt(1,100);
    return crypto.createHash('sha256').update(kunci_unik + random, 'utf8').digest('hex');
}


/*  GET semua pelanggan

*/
router.get('/semua', async (req, res) => {
    const koleksi = await Pengguna.find({});
    res.status(200).send(koleksi);
});

/*  GET pelanggan

*/
router.get('/satu/:nama', async (req, res) => {
    const { nama } = req.params;
    if (!nama) return res.status(400).send({ mesej: 'Perlukan nama'}); // Kembalikan mesej ralat
    const carian = { nama: nama };
    const dokumen = await Pengguna.findOne(carian) // Cari 1 dokumen mempunyai nilai `nama` yang sama (===)
    if (!dokumen) return res.status(400).send({ mesej: 'Pengguna tidak wujud'});
    res.status(200).send(dokumen);
})

/*  PUT (kemas kini) pelanggan

*/
router.put('/kemas_kini/:nama', async (req, res) => {
    const { nama } = req.params;
    const tapisan = { nama: nama }; // Tetapkan ciri nama dalam tapisan kepada nilai nama dalam pesanan
    const kemas_kini = { $set : req.body};
    await Pengguna.findOneAndUpdate(tapisan, kemas_kini);
    res.send({ mesej: 'Pengguna berjaya dikemaskini'});
})

/* POST cipta akaun pelanggan

*/
router.post('/baharu', async (req, res) => {
    try {
        const { emel, nama, kata_laluan } = req.body;
        
        if (!(emel && nama && kata_laluan)) {
            return res.status(400).send({ mesej: 'Sila lengkapkan butiran anda'});
        }

        const pengguna_lama = await Pengguna.findOne({ emel });

        if (pengguna_lama) {
            return res.status(409).send({ mesej: 'Emel sudah digunakan'})
        }

        const pengguna = { emel: emel, nama: nama, kata_laluan: kata_laluan};

        const emel_wujud = await Pengguna.findOne({ emel: emel });
        if (emel_wujud) return res.status(400).send({ mesej: 'Emel sudah diambil' });

        // const nama_wujud = await pangkalan_data.db('urusmarkah').collection('pengguna').findOne({ nama: nama });
        // if (nama_wujud) return res.status(400).send({ mesej: 'Nama sudah diambil' })

        await Pengguna.insertMany([pengguna]);
        res.status(200).send({ mesej: 'Pengguna baharu berjaya dicipta' });
    } catch (err) {
        console.log(err);
    }
})

router.post('/log_masuk', async (req, res) => {
    const { emel, kata_laluan } = req.body;
    if (!emel || !kata_laluan ) return res.status(400).send({mesej: 'Sila lengkapkan butiran anda'});
    const pengguna = { emel: emel };
    const dokumen = await pangkalan_data.db('urusmarkah').collection('pengguna').findOne(pengguna);
    if (kata_laluan !== dokumen.kata_laluan ) return res.status(400).send({ mesej: 'Emel atau kata laluan salah'});
    // return res.status(200).send({mesej: 'Login berjaya!'});
    const session = janaIdSession(emel);
    await pangkalan_data.db().collection('session').insertOne({ session_id: session });

    res.cookie('session_id', session, { maxAge: 1000000});
    res.status(200).end();
});

router.get('/log_masuk/pengguna', cookieParser(),  async (req, res) => {
    const { session_id } = req.cookies;
    console.log(req.cookies, session_id)
    if (!session_id) return res.status(400).send({ mesej: 'Session dilarang'});
    const session = await pangkalan_data.db().collection('session').findOne({ session_id: session_id});
    const { emel } = req.query;
    const maklumat_pengguna = await pangkalan_data.db().collection('pengguna').findOne({ emel: emel });
    console.log(maklumat_pengguna)
    res.status(200).send(maklumat_pengguna);
})

module.exports = router // Mengeksport router untuk digunakan oleh aplikasi