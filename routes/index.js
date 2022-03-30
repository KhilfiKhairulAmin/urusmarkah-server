const express = require('express');
const router = express.Router();
const { readFileSync } = require('fs');

const routeLog = (req, res, next) => {
    console.log(`URL: ${req.url}\nBody: ${req.body}\nParams: ${Object.keys(req.query)}`)
    next();
};

router.use(routeLog);

// Menghantar laman utama kepada pengguna
router.get('/', (req, res) => {
    res.writeHead(200, {"Content-Type":"text/html"});
    const utama = readFileSync("../client/pages/index.html");
    res.write(utama);
    res.end();
});

/* Menghantar semua jenis fail JS yang dipesan oleh pengguna
• fail JS yang dihantar adalah sebahagian daripada skrip HTML
*/
router.get('/*.js', (req, res) => {
    res.writeHead(200, {"Content-Type":"text/html"});
    const main = readFileSync(`../client/${req.url}`);
    res.write(main);
    res.end();
});

module.exports = router;