const express = require('express')
const router = express.Router()
const { MongoClient } = require("mongodb")
const { readFileSync } = require('fs')


// Pendirian pangkalan data
const url = `mongodb+srv://iNFiENiTE:${require('../‎')}@infienite-cluster.4j1az.mongodb.net/urusmarkah?retryWrites=true&w=majority`;
const pangkalan_data = new MongoClient(url);

// Menyambung hubungan dengan pangkalan data
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

// Penetapan middleware bagi kaedah permintaan POST
router.post('*', hubungPangkalanData, express.urlencoded())

// Dapatkan halaman
router.route('/')
.get((req, res) => {
    if (req.query.emel) {
        res.writeHead(200, {"Content-Type":"text/html"});
        const utama = readFileSync("../client/pages/utama.html");
        res.write(utama);
        res.end();
    }
    else {
        res.writeHead(200, {"Content-Type":"text/html"});
        const borang = readFileSync("../client/pages/borang.html");
        res.write(borang);
        res.end();
    }
})
.post(async (req, res) => { // Cipta akaun pengguna baharu
    const koleksi = pangkalan_data.db().collection("pengguna");
    const maklumatAkaunBaharu = { emel: req.body.emel, nama: req.body.nama }
    await koleksi.insertOne(maklumatAkaunBaharu);
    res.redirect(301, "http://localhost:3000");
});

router.route('log_masuk')
.get((req, res) => {
    res.writeHead(200, {"Content-Type":"text/html"})
    const borang = readFileSync("../client/pages/log_masuk.html")
    res.write(borang)
    res.end()
})
.post(async (req, res) => {
    const koleksi = pangkalan_data.db().collection("pengguna")
    const maklumatAkaun = { emel: req.body.emel }
    const carian = await koleksi.findOne(maklumatAkaun)
    if (carian.emel != undefined) {
        res.redirect(301, `http://localhost:3000/pengguna?emel=${carian.emel}`)
    }
    else {
        res.redirect(301, `http://localhost:3000/`)
    }
});

router.route('/utama')
.get(async (req, res) => {
    const koleksi = pangkalan_data.db().collection("pengguna");
    const maklumat = { emel: req.query.emel };
    const carian = await koleksi.findOne(maklumat);
    console.log(carian)
    res.status(200).send(carian);
});

module.exports = router;