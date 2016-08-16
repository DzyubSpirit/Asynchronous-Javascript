let net = require('net'),
    fs = require('fs');

let server = net.createServer( socket => {
  console.log('client connected');
  socket.on('end', () => console.log('client disconnected'));
  socket.write('Hello!\n');
  let fstream = fs.createReadStream('logs/2016-08-06-server.log');
  fstream.pipe(socket);
});

server.on('error', err => {
  throw err;
});

server.listen('8080', () => console.log('Server listening...'));
