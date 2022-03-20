const express = require("express");
const app = express();

app.listen(3000, () => {
    console.log("Listened")
})

app.get('/', (req, res) => {
    res.writeHead(200, {"Content-Type":"text/html"});
    res.write("Hello, User!");
    res.end();
})