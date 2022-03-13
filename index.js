const { createServer } = require('http');

const Server = createServer((req, res) => {
    res.writeHead(200, {'Content-Type':'text/html'});
    res.write('Hello World!');
    res.end();
})

Server.listen(3001);