const express = require("express");
const aplikasi = express();

// Penetapan port pendengaran server
const port = 3000;

aplikasi.listen(port, () => {
    console.log(`Mendengar pada port:${port}`)
});

// Penetapan router yang digunakan
const indexRoute = require('./routes/index');
aplikasi.use('/', indexRoute);

const penggunaRoute = require('./routes/pengguna');
aplikasi.use('/pengguna', penggunaRoute);