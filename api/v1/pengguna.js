const express = require('express'); // Modul Express digunakan untuk mencipta server HTTP dan API
const { MongoClient } = require('mongodb'); // Modul MongoDB digunakan untuk menggunakan pangkalan data MongoDB

const router = express.Router(); // Router Express digunakan untuk mengendalikan laluan pesanan (request route) oleh pengguna

/**
 *  URL yang digunakan untuk merujuk kepada pangkalan data sistem pada MongoDB
 */
const url_mongodb = `mongodb+srv://iNFiENiTE:${require('../../‎')}@infienite-cluster.4j1az.mongodb.net/urusmarkah?retryWrites=true&w=majority`
const pangkalan_data = new MongoClient(url_mongodb);

/**
 * Mengendalikan hubungan pangkalan data.
 * Fungsi ini membuka hubungan pangkalan data sebelum pengendalian pesanan.
 * @description Perisian tengah (Middleware)
 */
const hubunganPangkalanData = async (req, res, next) => {
    try {
        await pangkalan_data.connect();
        console.log("Hubungan berjaya!");
        await next()
    }
    catch (err) {
        console.log(err.stack)
    }
}

/*  Menetapkan perisian tengah
    - hubunganPangkalanData: memberi akses kepada pangkalan data bagi membolehkan oprasi CRUD dilaksanakan
    - express.json(): menukar mana-mana pesanan (request) JSON kepada objek
*/
router.use(hubunganPangkalanData, express.json())


/*  GET semua pelanggan

*/
router.get('/semua', async (req, res) => {
    let tapisan;
    if (!req.query.nama) tapisan = {}; // Tiada tapisan nama, akan mengembalikan semua dokumen
    else tapisan = { nama: req.query.nama }; // Mempunyai tapisan nama, akan mengembalikan dokumen yang mempunyai ciri nama sama (===) dengan ciri nama dalam tapisan
    const koleksi = pangkalan_data.db('urusmarkah').collection('pengguna').find(tapisan); // Cari semua dokumen yang mempunyai ciri tapisan yang sama
    const dokumen = await koleksi.toArray();
    res.status(200).send(dokumen);
});

/*  GET pelanggan

*/
router.get('/pengguna', async (req, res) => {
    if (!req.query.nama) return res.status(400).end(); // Kembalikan 400 kerana URL tidak menetapkan query nama
    const tapisan = { nama: req.query.nama }; // Tetapkan ciri nama dalam tapisan kepada nilai nama dalam pesanan
    const koleksi = await pangkalan_data.db('urusmarkah').collection('pengguna').findOne(tapisan); // Cari 1 dokumen mempunyai nilai nama yang sama (===)
    res.status(200).send(koleksi); 
})

/*  DELETE pelanggan

*/
router.delete('/padam', async (req, res) => {
    if (!req.query.nama) return res.status(400).end(); // Kembalikan 400 kerana URL tidak menetapkan query nama
    const tapisan = { nama: req.query.nama }; // Tetapkan ciri nama dalam tapisan kepada nilai nama dalam pesanan
    await pangkalan_data.db('urusmarkah').collection('pengguna').findOneAndDelete(tapisan); // Cari 1 dokumen mempunyai nilai nama yang sama (===) dan padamkan
    res.status(200).end();
})
.post('/', async (req, res) => { // Mengendalikan kemasukan data pengguna baharu
    const koleksi = pangkalan_data.db().collection("pengguna")
    const maklumatAkaunBaharu = { emel: req.body.emel, nama: req.body.nama }
    await koleksi.insertOne(maklumatAkaunBaharu)
    res.redirect(301, "http://localhost:3000")
})

router.post('/')


// Pengendalian route 'log_masuk'
router.route('/log_masuk')
.post(async (req, res) => { // Mengendalikan permintaan log masuk ke dalam sistem
    const koleksi = pangkalan_data.db().collection("pengguna")
    const maklumatAkaun = { emel: req.body.emel }
    const carian = await koleksi.findOne(maklumatAkaun)
    res.redirect(301, `http://localhost:3000/pengguna?emel=${carian.emel}`)
})

router.route('/utama')
.get(async (req, res) => { // Mengembalikan data berkaitan pengguna
    const koleksi = pangkalan_data.db().collection("pengguna")
    const maklumat = { emel: req.query.emel }
    const carian = await koleksi.findOne(maklumat)
    console.log(carian)
    res.status(200).send(carian)
});

module.exports = router // Mengeksport router untuk digunakan oleh aplikasi