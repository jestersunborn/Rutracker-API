// helpfull packages
require('colors');
// core packages
const Rutracker = require('../build/').default;
// Config
const { username, password } = require('./config');

const rutracker = new Rutracker();

rutracker.login(username, password)
  .then(() => {
    console.log(' Now u r logged in '.bgGreen.black);
    console.log('-------------------'.green);
  })
  .then(() => rutracker.search('Inception'))
  .then((res) => {
    const { id, status, size, author, title, seeds, leechs, downloads, date, url } = res.filter(item => item.id === '4676032')[0];
    console.log(' Id:     '.bgRed.black, id);
    console.log(' Status: '.bgGreen.black, status);
    console.log(' Title:  '.bgRed.black, title);
    console.log(' Author: '.bgRed.black, author);
    console.log(' Size:   '.bgBlue.black, `${size}`.blue);
    console.log(' Seeds:  '.bgGreen.black, `${seeds}`.green);
    console.log(' Leechs: '.bgRed.black, `${leechs}`.red);
    console.log(' Downloads: '.bgCyan.black, downloads.cyan);
    console.log(' Date: '.bgYellow.black, date);
    console.log(' URL: '.bgMagenta.black, url.magenta);
  })
  // .then(() => rutracker.getFullInfo('4676032'))
  // .then(res => console.log(res))
  .catch(err => console.error(err));
