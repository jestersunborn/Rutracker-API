// Import builded Rutracker class
const Rutracker = require('../lib');

// Config (import from JSON-config file './test/config.json')
const { username, password } = require('./config');

// Create an object of Rutracker
const rutracker = new Rutracker();

// Test ID
const ID = '0123456789';

// Write your tests here
// Use README.md documentation to see how all APIs work
rutracker.login(username, password)
    .then(() => rutracker.getUserInfo(ID))
    .then(console.log)
    .catch(console.error);
