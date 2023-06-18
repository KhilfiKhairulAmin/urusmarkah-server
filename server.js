const http = require('http');
const aplikasi = require("./aplikasi");
const server = http.createServer(aplikasi);

// Penetapan port pendengaran server
const { API_PORT } = process.env;
const port = process.env.PORT || API_PORT;

server.listen(port, () => {
    console.log(`Mendengar pada port:${port}`);
});