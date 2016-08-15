let https = require('https'),
    http = require('http'),
    fs = require('fs'),
    path = require('path');

let personId = 'id136470471';

function makeUrl(methodName, params) {
  var paramPairs = [];
  for (let prop in params) {
    paramPairs.push( encodeURIComponent(prop) + '='
                   + encodeURIComponent(params[prop]));
  }
  return `https://api.vk.com/method/${methodName}?${paramPairs.join('&')}&v=5.53`;
}

function getAllText(url, callback) {
  https.get(url, res => {
    var dataAll = '';
    res.on('data', data => dataAll += data);
    res.on('end', _ => callback(dataAll));
  });
}

console.log(makeUrl('users.get', { user_ids: personId }));
getAllText(makeUrl('users.get', { user_ids: personId }), humanInfoStr => {
  let humanInfo = JSON.parse(humanInfoStr).response[0];
  getAllText(makeUrl('photos.get', {
    owner_id: humanInfo.id,
    album_id: 'profile',
    rev: true,
    photo_sizes: true
  }), photosInfoStr => {
    let photosInfo = JSON.parse(photosInfoStr).response;  
    let urls = photosInfo.items.map(
          item => [item.id, item.sizes[item.sizes.length-1].src]);
    urls.forEach(([id, url]) => {
      http.get(url, res => res.pipe(fs.createWriteStream('img'+path.sep+id)));
    });
  });
});

