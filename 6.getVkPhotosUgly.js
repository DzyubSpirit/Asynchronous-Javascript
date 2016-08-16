let https = require('https'),
    http = require('http'),
    fs = require('fs'),
    path = require('path');

function makeUrl(methodName, params) {
  var paramPairs = [];
  for (let prop in params) {
    paramPairs.push( encodeURIComponent(prop) + '='
                   + encodeURIComponent(params[prop]));
  }
  return `https://api.vk.com/method/${methodName}?${paramPairs.join('&')}&v=5.53`;
}

let logStream = fs.createWriteStream('my.log');
fs.readFile('config.json', (err, dataStr) => {
  let personIds = JSON.parse(dataStr).personIds;
  logStream.write(`Reading personIds from config: ${personIds.toString()}\n`);
  var isAllRequestsSent = false,
      loadingImagesCount = 0;
  for (var personIdIndex = 0; personIdIndex < personIds.length; personIdIndex++) {
    let personId = personIds[personIdIndex];
    https.get(makeUrl('users.get', { user_ids: personId }), humanInfoStream => {
      var humanInfoStr = '';
      humanInfoStream.on('data', chunk => humanInfoStr += chunk);
      humanInfoStream.on('end', _ => {
        let humanInfo = JSON.parse(humanInfoStr).response[0];
        logStream.write(`Got info about ${JSON.stringify(humanInfo)}\n`);
        https.get(makeUrl('photos.get', {
          owner_id: humanInfo.id,
          album_id: 'profile',
          rev: true,
          photo_sizes: true
        }), photosInfoStream => {
          var photosInfoStr = '';
          photosInfoStream.on('data', chunk => photosInfoStr += chunk);
          photosInfoStream.on('end', _ => {
            let photosInfo = JSON.parse(photosInfoStr).response;  
            let urls = photosInfo.items.map(
                  item => [item.id, item.sizes[item.sizes.length-1].src]);

            logStream.write(`Get image ids and urls: ${urls}\n`);
            for (var i = 0; i < urls.length; i++) {
              let [id, url] = urls[i];
              http.get(url, imgStream => {
                let writeStream = fs.createWriteStream(
                      ['img', path.sep, humanInfo.id, id].join(''));
                imgStream.on('data', chunk => writeStream.write(chunk));
                imgStream.on('end', _ => {
                  writeStream.end();
                  logStream.write(`Got image from url ${url}\n`);
                  loadingImagesCount--;
                  if (isAllRequestsSent && loadingImagesCount === 0) {
                    logStream.end();
                  }
                });
              });
              loadingImagesCount++;
              if (i === urls.length - 1 && personIdIndex === personIds.length - 1)
                isAllRequestsSent = true;
            }
          });
        });
      });
    });
  }
});