// helpfull packages
require('colors');
// core packages
const Rutracker = require('../build/');
// Config
// const { username, password } = require('./config');

const rutracker = new Rutracker();

rutracker.getUserInfo('38431912')
  .then((res) => {
    console.log(' OK '.bgGreen.black);
    console.log(res);
  })
  .catch(err => console.error(err));
