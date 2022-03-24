const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.writeHead(200, {"Content-Type":"text/html"});
    const main = readFileSync("../client/index.html");
    res.write(main);
    res.end();
})