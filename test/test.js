// helpfull packages
require('colors');
// core packages
const Rutracker = require('../build/').default;
// Config
const { username, password } = require('./config');

const rutracker = new Rutracker();

rutracker.getCaptcha()
  .then((res) => {
    console.log(res);
  })
  .catch(err => console.error(err));
