const { readFileSync } = require('fs');
const express = require("express");
const app = express();

const routeLog = (req, res, next) => {
    console.log(`URL: ${req.url}\nBody: ${req.body}\nParams: ${req.params}`)
    next();
}

// Menetapkan port pendengaran server
app.listen(3000, () => {
    console.log("Listened")
})

// Menghantar laman utama kepada pengguna
app.get('/', (req, res) => {
    res.writeHead(200, {"Content-Type":"text/html"});
    const main = readFileSync("../client/index.html");
    res.write(main);
    res.end();
})

/* Menghantar semua jenis fail JS yang dipesan oleh pengguna
• fail JS yang dihantar adalah sebahagian daripada skrip HTML
*/
app.get('/*.js', routeLog, (req, res) => {
    res.writeHead(200, {"Content-Type":"text/html"});
    const main = readFileSync(`../client${req.url}`);
    res.write(main);
    res.end();
})
