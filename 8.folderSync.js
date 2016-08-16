let fs = require('fs'),
    net = require('net'),
    syncConfig = require('./syncConfig');

const PACKAGE_SEP = '{\f}';

if (process.argv[3]) {
  syncConfig.localPort = process.argv[2];
  syncConfig.remotePort = process.argv[3];
}

if (process.argv[4]) {
  syncConfig.folder = process.argv[4];
}

let clients = [],
    clientSock = tryConnect().on('error', () => { clientSock = null; }),
    fsChangingHandlers = {
      rename() {
      },
      change() {
      }
    };

net.createServer(c => {
  clients.push(c)
  if (clientSock === null && c.localAddress.indexOf(syncConfig.host) !== -1) {
    clientSock = tryConnect();
  }
}).listen(syncConfig.localPort);

fs.watch(syncConfig.folder, (eventType, filename) => {
  console.log('Writtenn');
  clients.forEach(client => {
    client.write(`${eventType}:${filename}${PACKAGE_SEP}`);
  });
});

function tryConnect() {
  let clientSock = net.connect(syncConfig.remotePort, syncConfig.host, () => {
    let sockData = '';
    clientSock.on('data', data => {
      sockData += data;
      let ind = sockData.indexOf(PACKAGE_SEP);
      if (ind !== -1) {
        let info = sockData.substring(0, ind),
            [eventType, filename] = info.split(':');
        console.log(eventType + ' ' + filename);
        sockData = sockData.substring(ind + PACKAGE_SEP.length);
      }
    });
  });
  return clientSock;
}
