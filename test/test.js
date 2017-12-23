// Helpers
require('colors');

// Core packages
const Rutracker = require('../lib');

// Config
// const { username, password } = require('./config');

const rutracker = new Rutracker();

rutracker.getCategories(true)
  .then((res) => {
    console.log(res);
  })
  .catch(err => console.error(err));
