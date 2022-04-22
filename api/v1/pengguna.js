const express = require('express'); // Modul Express digunakan untuk mencipta server HTTP dan API
const Pengguna = require('../../model/Pengguna'); // Modul Mongoose digunakan untuk menggunakan pangkalan data MongoDB
const crypto = require('crypto');
require('dotenv').config()
require('../../konfig/pangkalan_data').connect();
const cookieParser = require('cookie-parser');
const router = express.Router(); // Router Express digunakan untuk mengendalikan laluan pesanan (request route) oleh pengguna

const janaIdSession = (kunci_unik) => {
    const random = crypto.randomInt(1,100);
    return crypto.createHash('sha256').update(kunci_unik + random, 'utf8').digest('hex');
}

/*  Menetapkan perisian tengah
    - hubunganPangkalanData: memberi akses kepada pangkalan data bagi membolehkan oprasi CRUD dilaksanakan
    - express.json(): menukar mana-mana pesanan (request) JSON kepada objek
*/
router.use(express.json())


/*  GET semua pelanggan

*/
router.get('/semua', async (req, res) => {
    const koleksi = await Pengguna.find({});
    console.log(koleksi)
    res.status(200).send(koleksi);
});

/*  GET pelanggan

*/
router.get('/satu/:nama', async (req, res) => {
    const { nama } = req.params;
    if (!nama) return res.status(400).send({ mesej: 'Perlukan nama'}); // Kembalikan mesej ralat
    const carian = { nama: nama };
    const dokumen = await pangkalan_data.db('urusmarkah').collection('pengguna').findOne(carian); // Cari 1 dokumen mempunyai nilai `nama` yang sama (===)
    if (!dokumen) return res.status(400).send({ mesej: 'Pengguna tidak wujud'});
    res.status(200).send(dokumen);
})

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

/*  PUT (kemas kini) pelanggan

*/
router.put('/kemas_kini/:nama', async (req, res) => {
    const { nama } = req.params;
    const tapisan = { nama: nama }; // Tetapkan ciri nama dalam tapisan kepada nilai nama dalam pesanan
    const kemas_kini = { $set : req.body};
    await pangkalan_data.db('urusmarkah').collection('pengguna').findOneAndUpdate(tapisan, kemas_kini)
    res.end()
})

router.post('/baharu', async (req, res) => {
    const { emel, nama, kata_laluan } = req.body;
    if (!emel || !nama || !kata_laluan) return res.status(400).send({ mesej: 'Sila lengkapkan butiran anda'});
    const pengguna = { emel: emel, nama: nama, kata_laluan: kata_laluan};

    const emel_wujud = await pangkalan_data.db('urusmarkah').collection('pengguna').findOne({ emel: emel });
    if (emel_wujud) return res.status(400).send({ mesej: 'Emel sudah diambil' });

    // const nama_wujud = await pangkalan_data.db('urusmarkah').collection('pengguna').findOne({ nama: nama });
    // if (nama_wujud) return res.status(400).send({ mesej: 'Nama sudah diambil' })

    await pangkalan_data.db('urusmarkah').collection('pengguna').insertOne(pengguna);
    res.status(200).send({ mesej: 'Pengguna baharu berjaya dicipta' });
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

module.exports = router // Mengeksport router untuk digunakan oleh aplikasi