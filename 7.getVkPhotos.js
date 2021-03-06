let https = require('https'),
    http = require('http'),
    fs = require('fs'),
    path = require('path');

function makeUrl(methodName, params) {
  var paramPairs = [];
  for (let prop in params) {
    paramPairs.push(
      encodeURIComponent(prop) + '=' +
      encodeURIComponent(params[prop])
    );
  }
  return `https://api.vk.com/method/${methodName}?${paramPairs.join('&')}&v=5.53`;
}

function getAllText(url, callback) {
  https.get(url, res => {
    var dataAll = '';
    res.on('data', data => dataAll += data);
    res.on('end', () => callback(dataAll));
  });
}

let logStream = fs.createWriteStream('my.log');

readPersonIds('config.json');

function readPersonIds(filename) {
  fs.readFile(filename, (err, dataStr) => {
    if (err) throw err;
    let personIds = JSON.parse(dataStr).personIds;
    logStream.write(`Reading personIds from config: ${personIds.toString()}\n`);
    getUsersInfo(personIds);
  });
}

function getUsersInfo(personIds) {
  personIds.forEach(personId => {
    getAllText(makeUrl('users.get', { user_ids: personId }), humanInfoStr => {
      let humanInfo = JSON.parse(humanInfoStr).response[0];
      logStream.write(`Got info about ${JSON.stringify(humanInfo)}\n`);
      getUserPhotos(humanInfo);
    });
  });
}

function getUserPhotos(userInfo) {
  getAllText(makeUrl('photos.get', {
    owner_id: userInfo.id,
    album_id: 'profile',
    rev: true,
    photo_sizes: true
  }), photosInfoStr => {
    let photosInfo = JSON.parse(photosInfoStr).response;
    let idAndUrls = photosInfo.items.map(
      item => [item.id, item.sizes[item.sizes.length-1].src]
    );

    logStream.write(`Get image ids and urls: ${idAndUrls}\n`);
    idAndUrls.forEach(getImageByIdAndUrl);
  });
}

function getImageByIdAndUrl([id, url]) {
  http.get(url, res => {
   let writeStream = fs.createWriteStream(
     ['img', path.sep, id].join('')
   );
   res.pipe(writeStream);
   res.on('end', () => {
     logStream.write(`Got image from url ${url}\n`);
   });
 });
}
