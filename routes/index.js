const express = require('express');
const router = express.Router();
const { readFileSync } = require('fs');

router.get('/', (req, res) => {
    res.writeHead(200, {"Content-Type":"text/html"});
    const main = readFileSync("../client/index.html");
    res.write(main);
    res.end();
})

module.exports = router;