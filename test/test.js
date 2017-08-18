console.log('\x1Bc');
// helpfull packages
require('colors');
// core packages
const Rutracker = require('../app/');
// Config
const { username, password } = require('./config');

const rutracker = new Rutracker();

rutracker.login(username, password);

rutracker.addListener('login', () => {
  console.log(' Now u r logged in '.bgGreen.black);
});
