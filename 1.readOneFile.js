let fs = require('fs');

function proccessFileData(err, data) {
  if (err) {
    console.log('Error loading file: ' + err + '\n');
    return;
  }
  console.log('Field loaded');
  console.log('Buffer: ' + data);
  console.log('String: ' + data.toString());
}

fs.readFile('test.txt', proccessFileData);
fs.readFile('noFile', proccessFileData);

function makeFilename(date, logType) {
  return `${date}-${logType}.log`;
}

let dateLength = 10,
    dates = ['2016-08-01', '2016-08-02', '2016-08-05', '2016-08-06'],
    logTypes = ['access', 'cloud', 'debug', 'error', 'node', 'server', 'slow', 'warning'];

dates.forEach(date => {
  logTypes.forEach(logType => {
    console.log(makeFilename(date, logType));
  });
});
