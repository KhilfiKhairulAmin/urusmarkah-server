const express = require('express');
const router = express.Router();
const { MongoClient } = require("mongodb");
const { readFileSync } = require('fs');


// Dapatkan halaman borang
router.get("/", (req, res) => {
    res.writeHead(200, {"Content-Type":"text/html"});
    const borang = readFileSync("../client/borang.html");
    res.write(borang);
    res.end();
});


// Pendirian pangkalan data
const url = `mongodb+srv://iNFiENiTE:${require('../‎')}@infienite-cluster.4j1az.mongodb.net/urusmarkah?retryWrites=true&w=majority`;
const pangkalan_data = new MongoClient(url);

// Menyambung hubungan dengan pangkalan data
const hubungPangkalanData = async (req, res, next) => {
    try {
        await pangkalan_data.connect();
        console.log("Hubungan berjaya!");
        await next().then(pangkalan_data.close())
    }
    catch (err) {
        console.log(err.stack)
    }
};

// Penetapan middleware bagi penggunaan pangkalan data
router.use(express.urlencoded())
router.use(hubungPangkalanData);

// Cipta akaun pengguna baharu
router.post("/", async (req, res) => {
    const koleksi = pangkalan_data.db("urusmarkah").collection("pengguna");
    const maklumatAkaunBaharu = { emel: req.body.emel, nama: req.body.nama }
    await koleksi.insertOne(maklumatAkaunBaharu);
    res.redirect(301, "http://localhost:3000");
});

module.exports = router;