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
  .then(() => {
    // Write your test here...
  })
  .catch(err => console.error(err));
