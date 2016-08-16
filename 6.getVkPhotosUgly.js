let https = require('https'),
    http = require('http'),
    fs = require('fs'),
    path = require('path');

function makeUrl(methodName, params) {
  let paramPairs = [];
  for (let prop in params) {
    paramPairs.push( encodeURIComponent(prop) + '='
                   + encodeURIComponent(params[prop]));
  }
  return `https://api.vk.com/method/${methodName}?${paramPairs.join('&')}&v=5.53`;
}

let logStream = fs.createWriteStream('my.log', { flags: 'a' });
fs.readFile('config.json', (err, dataStr) => {
  let personIds = JSON.parse(dataStr).personIds;
  logStream.write(`Reading personIds from config: ${personIds.toString()}\n`);
  let loadingPersonsCount = personIds.length,
      loadingImagesCount = 0;
  for (let personIdIndex = 0; personIdIndex < personIds.length; personIdIndex++) {
    let personId = personIds[personIdIndex];
    https.get(makeUrl('users.get', { user_ids: personId }), humanInfoStream => {
      let humanInfoStr = '';
      humanInfoStream.on('data', chunk => humanInfoStr += chunk);
      humanInfoStream.on('end', () => {
        let humanInfo = JSON.parse(humanInfoStr).response[0];
        logStream.write(`Got info about ${JSON.stringify(humanInfo)}\n`);
        https.get(makeUrl('photos.get', {
          owner_id: humanInfo.id,
          album_id: 'profile',
          rev: true,
          photo_sizes: true
        }), photosInfoStream => {
          let photosInfoStr = '';
          photosInfoStream.on('data', chunk => photosInfoStr += chunk);
          photosInfoStream.on('end', () => {
            let photosInfo = JSON.parse(photosInfoStr).response;
            let urls = photosInfo.items.map(
                  item => [item.id, item.sizes[item.sizes.length-1].src]);

            loadingPersonsCount--;
            loadingImagesCount += urls.length;
            logStream.write(`Get image ids and urls: ${urls}\n`);
            for (let i = 0; i < urls.length; i++) {
              let [id, url] = urls[i];
              http.get(url, imgStream => {
                let writeStream = fs.createWriteStream(
                      ['img', path.sep, humanInfo.id, id].join(''));
                imgStream.on('data', chunk => writeStream.write(chunk));
                imgStream.on('end', () => {
                  writeStream.end();
                  logStream.write(`Got image from url ${url}\n`);
                  loadingImagesCount--;
                  if (loadingPersonsCount === 0 && loadingImagesCount === 0) {
                    logStream.write('Session end\n');
                    logStream.end();
                  }
                });
              });
            }
          });
        });
      });
    });
  }
});
