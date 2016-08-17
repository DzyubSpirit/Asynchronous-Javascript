let https = require('https');

let url = 'https://raw.githubusercontent.com/metarhia/JSTP/master/README.md';
let links = [];
let repos = {};

https.get(url, res => {
  let allData = '',
      bracketState = 'lookFor[';

  res.on('data', data => allData += data);

  res.on('end', () => {
    let offset = 0;
    while (offset < allData.length) {
      let [newLink, newOffset] = getLink(allData, offset);
      if (newLink !== null) links.push(newLink);
      offset = newOffset;
    }
    links = links.filter(
      str => str[0] !== '#' &&
      str.indexOf('https://github.com/metarhia') === -1
    );

    links.forEach(link => {
      console.log(link);
      https.get(link, res => {
        let allData = '';
        res.on('data', data => allData += data);
        res.on('end', () => repos[link] = allData);
      });
    });
  });
}).on('error', err => console.log(err));

function getLink(allData, offset) {
  let ind1 = allData.indexOf('[', offset),
      end = true,
      newLink = null;
  if (ind1 !== -1) {
    offset = ind1 + 1;
    let ind2 = allData.indexOf(']', offset),
        ind3 = ind2 + 1;
    if (ind2 !== -1 && ind3 < allData.length) {
      offset = ind3 + 1;
      end = false;
      if (allData[ind3] === '(') {
        let ind4 = allData.indexOf(')', offset);
        if (ind4 !== -1) {
          offset = ind4 + 1;
          newLink = allData.substring(ind3 + 1, ind4);
        } else {
          end = true;
        }
      }
    }
  }
  if (end) offset = allData.length;
  return [newLink, offset];
}
