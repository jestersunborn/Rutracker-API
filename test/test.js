// helpfull packages
require('colors');
// core packages
const Rutracker = require('../build/').default;
// Config
const { username, password } = require('./config');

const rutracker = new Rutracker();

rutracker.login(username, password)
  .then((res) => {
    console.log(' OK '.bgGreen.black);
    console.log(res);
  })
  .then(() => rutracker.search('Inception', 'size', true))
  // .then(res => console.log(res))
  .catch(err => console.error(err));
