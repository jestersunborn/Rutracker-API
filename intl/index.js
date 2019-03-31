const statuses = require('./statuses');
const months = require('./months');
const countries = require('./countries');
const userInfo = require('./userInfo');

module.exports = {
  ...statuses,
  ...months,
  ...countries,
  ...userInfo,
};
