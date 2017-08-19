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
  })
  .then(() => rutracker.search('Inception'))
  // .then(res => console.log(res))
  .then(() => rutracker.getFullInfo('4676032'))
  .then(res => console.log(res))
  .catch(err => console.error(err));
