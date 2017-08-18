// helpfull packages
require('colors');
// core packages
const Rutracker = require('../build/').default;
// Config
const { username, password } = require('./config');


const rutracker = new Rutracker(username, password);


rutracker.addListener('login-success', () => {
  console.log(' Now u r logged in '.bgGreen.black);
  rutracker.search('Inception', (res) => {
    console.log(res);
  });
});

rutracker.addListener('login-error', () => {
  console.log(' Please check your username or password '.bgRed.white);
});
