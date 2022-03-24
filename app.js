const express = require("express");
const app = express();
const indexRoute = require('./routes/index');

// Penetapan port pendengaran server
app.listen(3000, () => {
    console.log("Listened")
})

// Penetapan router yang digunakan
app.use('/', indexRoute);