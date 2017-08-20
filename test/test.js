// helpfull packages
require('colors');
// core packages
const Rutracker = require('../build/').default;
// Config
const { username, password } = require('./config');

const rutracker = new Rutracker();

rutracker.login(username, password)
  .then(() => {
    console.log(' OK '.bgGreen.black);
  })
  .catch(err => console.error(err));
