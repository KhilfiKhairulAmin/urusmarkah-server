import { IncomingMessage, ServerResponse } from "http";

const { createServer } = require('http');

const Server = createServer((req: IncomingMessage, res: ServerResponse) => {
    res.writeHead(200, {'Content-Type':'text/html'});
    res.write('Hello World!');
    res.end();
})

Server.listen(3001);