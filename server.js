var http = require('http');

var server = http.createServer(function(req, res) {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('dcsoundchicks-app-data');
});

server.listen(process.env.PORT || 3000);