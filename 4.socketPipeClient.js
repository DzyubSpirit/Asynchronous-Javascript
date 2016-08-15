const net = require('net');

let socket = net.createConnection({ 
  host: '127.0.0.1', 
  port: '8080'
}, _ => {
  console.log('connected');
  socket.pipe(process.stdout);
});

socket.on('end', _ => console.log('disconnected'));
