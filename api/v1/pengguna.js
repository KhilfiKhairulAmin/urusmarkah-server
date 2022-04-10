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


/*  GET 

*/
router.get('/semua_pengguna', async (req, res) => {
    let tapisan;
    if (!req.query.nama) tapisan = {};
    else tapisan = { nama: req.query.nama };
    const koleksi = pangkalan_data.db('urusmarkah').collection('pengguna').find(tapisan);
    const baca = await koleksi.toArray();
    res.status(200).send(baca);
});

router.get('/pengguna', async (req, res) => {

})

// Pengendalian route '/'
router.route('/')
.post(async (req, res) => { // Mengendalikan kemasukan data pengguna baharu
    const koleksi = pangkalan_data.db().collection("pengguna")
    const maklumatAkaunBaharu = { emel: req.body.emel, nama: req.body.nama }
    await koleksi.insertOne(maklumatAkaunBaharu)
    res.redirect(301, "http://localhost:3000")
})

// Pengendalian route 'log_masuk'
router.route('/log_masuk')
.get((req, res) => { // Mengembalikan halaman html log masuk
    res.writeHead(200, {"Content-Type":"text/html"})
    const borang = readFileSync("../client/pages/log_masuk.html")
    res.write(borang)
    res.end()
})
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