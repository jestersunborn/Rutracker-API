import cheerio from 'cheerio';

const getStatus = (title) => {
  switch (title) {
    case 'проверено':
      return 'approved';
    case 'сомнительно':
      return 'doubtfully';
    case 'не проверено':
      return 'not-approved';
    case 'временная':
      return 'temporary';
    default:
      return 'unnamed-status';
  }
};

const translateMonth = (month) => {
  switch (month) {
    case 'Янв': return 'Jan';
    case 'Фев': return 'Feb';
    case 'Мар': return 'Mar';
    case 'Апр': return 'Apr';
    case 'Май': return 'May';
    case 'Июн': return 'Jun';
    case 'Июл': return 'Jul';
    case 'Авг': return 'Aug';
    case 'Сен': return 'Sep';
    case 'Окт': return 'Oct';
    case 'Нбр': return 'Nov';
    case 'Дек': return 'Dec';
    default: return month;
  }
};

const formatDate = (date) => {
  const regExp = /([0-9]{1,2})-(.*)-([0-9]{1,2})/g;
  const day = date.replace(regExp, `$1`);
  const month = translateMonth(date.replace(regExp, `$2`));
  const year = `20${date.replace(regExp, `$3`)}`;
  return { day, month, year };
};

// Parse search results
export const parseSearch = (html, host) => {
  const $ = cheerio.load(html);

  return $('#tor-tbl tbody').find('tr').map((_, track) => ({
    id: $(track).find('td.t-title .t-title a').attr('data-topic_id'),
    status: getStatus($(track).find('td:nth-child(2)').attr('title')),
    title: $(track).find('td.t-title .t-title a').text(),
    author: $(track).find('td.u-name .u-name a ').html(),
    category: {
      id: $(track).find('td.f-name .f-name a').attr('href').replace(/.*?f=([0-9]*)$/g, '$1'),
      name: $(track).find('td.f-name .f-name a').text(),
    },
    size: +$(track).find('td.tor-size u').html(),
    seeds: +$(track).find('b.seedmed').html(),
    leechs: +$(track).find('td.leechmed b').html(),
    downloads: +$(track).find('td.number-format').html(),
    date: formatDate($(track).find('td:last-child p').text()), // Upload date
    url: `http://${host}/forum/viewtopic.php?t=${$(track).find('td.t-title .t-title a').attr('data-topic_id')}`,
  }))
    .get()
    .filter(x => x.id);
};

// Parse full info
export const parseFullInfo = (html) => {
  const $ = cheerio.load(html);
  const img = $('var.postImg').attr('title');
  const body = $('.post_body .post-font-serif1').text();
  const categories = $('.nav.w100.pad_2 a').map((index, a) => $(a).text()).get();
  return { img, body, categories };
};

// Parse categories
export const parseCategories = (html, deep) => {
  const $ = cheerio.load(html);
  const wrap = $('#forums_wrap td:first-child');
  const categories = $(wrap).find('.category');
  if (deep) {
    return $(categories).map((_, category) => ({
      id: $(category).attr('id').replace('c-', ''),
      name: $(category).find('h3 a').text(),
      subCategories: $(category).find('table.forums tr td:last-child').map((__, subCategory) => ({
        id: $(subCategory).find('h4 a').attr('href').replace(/(.*)f=([0-9]*)$/g, `$2`),
        name: $(subCategory).find('h4 a').text(),
        subCategories: $(subCategory).find('.subforums .sf_title a').map((___, subSubCategory) => ({
          id: $(subSubCategory).attr('href').replace(/(.*)f=([0-9]*)$/g, `$2`),
          name: $(subSubCategory).text(),
        })).get() || null,
      })).get() || null,
    })).get();
  }
  return $(categories).map((index, category) => ({
    id: $(category).attr('id').replace('c-', ''),
    name: $(category).find('h3 a').text(),
  })).get();
};
