const express = require('express');
const router = express.Router();
const { MongoClient } = require("mongodb");

const url = `mongodb+srv://iNFiENiTE:${require('../‎')}@infienite-cluster.4j1az.mongodb.net/myfirstmongodb?retryWrites=true&w=majority`;
const pangkalan_data = new MongoClient(url);

const hubunganPangkalanData = async (req, res, next) => {
    try {
        await pangkalan_data.connect();
        console.log("Hubungan berjaya!")
        next();
    }
    catch (err) {
        console.log(err.stack)
    }
}

router.use(hubunganPangkalanData)


router.get("/", (req, res) => {
    res.end("USER ACCESSED!");
});

module.exports = router;