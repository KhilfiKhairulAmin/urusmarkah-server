const express = require('express')
const router = express.Router()
const { MongoClient } = require('mongodb')
const { readFileSync } = require('fs')


// Pendirian pangkalan data
const url = `mongodb+srv://iNFiENiTE:${require('../‎')}@infienite-cluster.4j1az.mongodb.net/urusmarkah?retryWrites=true&w=majority`
const pangkalan_data = new MongoClient(url)

// Mewujudkan hubungan dengan pangkalan data cloud (MongoDB)
const hubungPangkalanData = async (req, res, next) => {
    try {
        await pangkalan_data.connect();
        console.log("Hubungan berjaya!");
        await next()
    }
    catch (err) {
        console.log(err.stack)
    }
}


// Penetapan perisian tengah bagi kaedah permintaan POST
router.post('*', hubungPangkalanData, express.urlencoded())


// Pengendalian route '/'
router.route('/')
.get((req, res) => { // Mengembalikan laman html*
    if (req.query.emel) {
    /* Jika terdapat query emel daripada pengguna
       kembalikan laman utama pengguna
    */
        res.writeHead(200, {"Content-Type":"text/html"})
        const utama = readFileSync("../client/pages/utama.html")
        res.write(utama)
        res.end()
    }
    else {
    /* Default: kembalikan laman utama produk
    */
        res.writeHead(200, {"Content-Type":"text/html"})
        const borang = readFileSync("../client/pages/borang.html")
        res.write(borang)
        res.end()
    }
})
.post(async (req, res) => { // Mengendalikan kemasukan data pengguna baharu
    const koleksi = pangkalan_data.db().collection("pengguna")
    const maklumatAkaunBaharu = { emel: req.body.emel, nama: req.body.nama }
    await koleksi.insertOne(maklumatAkaunBaharu)
    res.redirect(301, "http://localhost:3000")
})

// Pengendalian route 'log_masuk'
router.route('log_masuk')
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