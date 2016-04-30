/**
 * Created by boris on 4/30/2016.
 */
//simplest test
//run with node simpletest.js
var http = require('http');
http.createServer(function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('hello world\n');
}).listen(1337, "127.0.0.1");
console.log('Server running at http://127.0.0.1:1337/');