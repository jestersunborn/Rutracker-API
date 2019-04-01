const getMonthNumber = (month) => {
  switch (month) {
    case 'Янв': return 0;
    case 'Фев': return 1;
    case 'Мар': return 2;
    case 'Апр': return 3;
    case 'Май': return 4;
    case 'Июн': return 5;
    case 'Июл': return 6;
    case 'Авг': return 7;
    case 'Сен': return 8;
    case 'Окт': return 9;
    case 'Ноя': return 10;
    case 'Дек': return 11;
    default: return 0;
  }
};

const formatCreateDate = (date) => {
  // Get new date
  const d = new Date();
  // Regular expression for date format: "YYYY-MM-DD"
  const regex = /([0-9]{4})-([0-9]{2})-([0-9]{2})/g;
  // Get year from date
  const year = date.replace(regex, `$1`);
  // Set to our date
  d.setFullYear(Number(year));
  // Get month
  const month = date.replace(regex, `$2`);
  // Set month to date (-1 because month start from 0)
  d.setMonth(month - 1);
  // Get day
  const day = date.replace(regex, `$3`);
  // Set day
  d.setDate(Number(day));
  // Set start hours
  d.setHours(0, 0, 0);
  return d;
};

const formatDate = (date) => {
  const d = new Date();
  const regExp = /^([0-9]{1,2})-(.*)-([0-9]{2})$/g;

  const year = `20${date.replace(regExp, `$3`)}`;
  d.setFullYear(Number(year));

  const month = getMonthNumber(date.replace(regExp, `$2`));
  d.setMonth(month);

  const day = date.replace(regExp, `$1`);
  d.setDate(Number(day));

  d.setHours(0, 0, 0);

  return d;
};

module.exports = {
  getMonthNumber,
  formatCreateDate,
  formatDate,
};
