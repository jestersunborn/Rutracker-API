// helpfull packages
require('colors');
// core packages
const Rutracker = require('../build/').default;
// Config
const { username, password } = require('./config');

const rutracker = new Rutracker();

rutracker.login(username, password)
  .then(() => {
    console.log(' Now u r logged in '.bgGreen.black);
    console.log('-------------------'.green);
  })
  .then(() => rutracker.search('Inception', 'date', true))
  .then(res => console.log(res.map(({ date: { day, month, year } }) => `${day}-${month}-${year}`)))
  .catch(err => console.error(err));
