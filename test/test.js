// Helpers
require('colors');

// Core packages
const Rutracker = require('../lib');

// Config
const { username, password } = require('./config');

const rutracker = new Rutracker();

rutracker.login(username, password)
    .then(() => rutracker.getStats())
    .then((res) => {
        console.log(res);
    })
    .catch((err) => {
        console.log(JSON.stringify(err));
    });
