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
    const koleksi = pangkalan_data.db('urusmarkah').collection('pengguna').find(); // Cari semua dokumen
    const dokumen = await koleksi.toArray();
    res.status(200).send(dokumen);
});

/*  GET pelanggan

*/
router.get('/satu/:nama', async (req, res) => {
    const { nama } = req.params;
    if (!nama) {
        return res.status(400).send({ mesej: 'Perlukan nama'}); // Kembalikan mesej ralat
    }
    const carian = { nama: nama };
    const dokumen = await pangkalan_data.db('urusmarkah').collection('pengguna').findOne(carian); // Cari 1 dokumen mempunyai nilai `nama` yang sama (===)
    res.status(200).send(dokumen); 
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
    await pangkalan_data.db('urusmarkah').collection('pengguna').insertOne(pengguna);
    res.status(200).end();
})

router.post('/login', async (req, res) => {
    const { emel, kata_laluan } = req.body;
    if (!emel || !kata_laluan ) return res.send({mesej: 'Sila lengkapkan butiran anda'});
    const pengguna = { emel: emel };
    const dokumen = await pangkalan_data.db('urusmarkah').collection('pengguna').findOne(pengguna);
    if (kata_laluan !== dokumen.kata_laluan ) return res.status(400).send({ mesej: 'Katalaluan salah'});
    return res.status(200).send({mesej: 'Login berjaya!'});
})

module.exports = router // Mengeksport router untuk digunakan oleh aplikasi