let fs = require('fs'),
    path =require('path');

const dateLength = 10,
      datetimeLength = 24;

function makeFilename(date, logType) {
  return `${date}-${logType}.log`;
}

function isTimeBetween(startDate, endDate, line) {
  let date = Date.parse(line.substring(0, datetimeLength));
  let res = date - startDate >= 0 && endDate - date > 0;
  return res;
}

function getLogsBetween(startTime, endTime) {
  let dates = ['2016-08-01', '2016-08-02', '2016-08-05', '2016-08-06'],
      logTypes = ['cloud', 'debug', 'error', 'node', 'server', 'slow', 'warning'];

  dates.forEach(date => {
    let startDate = Date.parse(`${date}T${startTime}Z`),
        endDate = Date.parse(`${date}T${endTime}Z`);
    logTypes.forEach(logType => {
      let filename = 'logs' + path.sep + makeFilename(date, logType);
      fs.readFile(filename, function(err, data) {
        if (err) return;
        data.toString().split('\n').filter(
          isTimeBetween.bind(null, startDate, endDate)
        ).forEach(logRecord => {
          console.log(`${logType}: ${logRecord}`);
        });
      });
    });
  });
}

getLogsBetween('17:00:00.000', '17:02:00.000');
