var createServer = require('http').createServer;
var Server = createServer(function (req, res) {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.write('Hello World!');
    res.end();
});
Server.listen(3001);
