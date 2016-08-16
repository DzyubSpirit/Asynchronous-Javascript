let fs = require('fs');

function proccessFileData(err, data) {
  if (err) {
    console.log('Error loading file: ' + err);
    return;
  }
  console.log('Field loaded');
  console.log('Buffer: ' + data);
  console.log('String: ' + data.toString());
}

fs.readFile('test.txt', proccessFileData);
fs.readFile('noFile', proccessFileData);
