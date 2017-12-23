import categories from './categories';
import statuses from './statuses';
import months from './months';
import countries from './countries';
import userInfo from './userInfo';

export default {
  ...categories,
  ...statuses,
  ...months,
  ...countries,
  ...userInfo,
  undefined: 'N/A',
};
