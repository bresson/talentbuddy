var http = require('http');




var server = http.createServer(handleRequest);

function handleRequest(req, res) {
	res.writeHead(200, {'Content-type': 'text/plain'});
	res.end('Hello! ');
}

server.listen(3000, '127.0.0.1');

module.exports = server;