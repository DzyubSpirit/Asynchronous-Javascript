var fs = require('fs'),
    path = require('path');

function concatFilesIn(sources, destination) {
  let destStream = fs.createWriteStream(destination);
  let endedStreamsCount = 0;
  sources.map(x => fs.createReadStream(x)).forEach(sourceStream => {
    sourceStream.on('end', () => {
      endedStreamsCount++;
      if (endedStreamsCount === sources.length) destStream.end();
    });
    pipe(sourceStream, destStream);
  });
}

function pipe(sourceStream, destinationStream) {
  sourceStream.on('data', data => destinationStream.write(data));
}

function inLogs(filename) {
  return 'logs' + path.sep + filename;
}

concatFilesIn([
  '2016-08-05-error.log',
  '2016-08-05-node.log',
  '2016-08-05-server.log'
].map(inLogs), inLogs('2016-08-05.log'));
