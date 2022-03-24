const { readFileSync } = require('fs');
const express = require("express");
const app = express();

app.listen(3000, () => {
    console.log("Listened")
})

app.get('/', (req, res) => {
    res.writeHead(200, {"Content-Type":"text/html"});
    const main = readFileSync("../client/index.html");
    res.write(main);
    res.end();
})

app.get('/index.js', (req, res) => {
    res.writeHead(200, {"Content-Type":"text/html"});
    const main = readFileSync("../client/index.js");
    res.write(main);
    res.end();
})

