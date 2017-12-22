// Helpers
require('colors');

// Core packages
const Rutracker = require('../lib');

// Config
// const { username, password } = require('./config');
console.log(Rutracker);
const rutracker = new Rutracker();

rutracker.getUserInfo('38431912')
  .then((res) => {
    console.log(' OK '.bgGreen.black);
    console.log(res);
  })
  .catch(err => console.error(err));
