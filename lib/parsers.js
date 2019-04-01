const cheerio = require('cheerio');
const translate = require('../intl');
const { formatDate, formatCreateDate } = require('./formatters.js');


// Parse search results
const parseSearch = (html, host) => {
  const $ = cheerio.load(html);

  const condition = $('#tor-tbl tbody').find('tr td:first-child').attr('colspan') === '10';

  return !condition
    ? $('#tor-tbl tbody')
    .find('tr')
    .map((_, track) => ({
      id: $(track).find('td.t-title .t-title a').attr('data-topic_id'),
      status: translate[$(track).find('td:nth-child(2)').attr('title')],
      title: $(track).find('td.t-title .t-title a').text(),
      author: $(track).find('td.u-name .u-name a ').text(),
      category: {
        id: $(track).find('td.f-name .f-name a').attr('href').replace(/.*?f=([0-9]*)$/g, '$1'),
        name: $(track).find('td.f-name .f-name a').text(),
      },
      size: +$(track).find('td.tor-size u').html(),
      seeds: +$(track).find('b.seedmed').html(),
      leechs: +$(track).find('td.leechmed b').html(),
      downloads: +$(track).find('td.number-format').html(),
      uploadDate: formatDate($(track).find('td:last-child p').text()),
      url: `http://${host}/forum/viewtopic.php?t=${$(track).find('td.t-title .t-title a').attr('data-topic_id')}`,
    }))
    .get()
    .filter(x => x.id)
    : [];
};

// Get count of pages
const parsePageInfo = (html) => {
  const $ = cheerio.load(html);
  const pageInfo = {
    count: 1,
    id: 1,
  };

  const isOnlyOnePage = Boolean($('#main_content_wrap .bottom_info .nav p[style="float: right"]').text());
  if (!isOnlyOnePage) {
    pageInfo.count = +$('#main_content_wrap .bottom_info .nav p[style="float: right"]')
      .text()
      .replace(/(.*), ([0-9]*).*$/g, '$2');

    // TODO: Regexp Bug, examples:
    //  Metro Exodus
    //  Фиксики
    //  Лох
    //  Аниматрица
    pageInfo.id = $($('#main_content_wrap .bottom_info .nav p:nth-child(2) a')[1])
      .attr('href')
      .replace(/.*search_id=(.*)&.*$/g, '$1');
  }

  return pageInfo;
};

// Parse full info
const parseFullInfo = (html) => {
  const $ = cheerio.load(html);
  const img = $('var.postImg').attr('title');
  const body = $('.post_body .post-font-serif1').text();
  const categories = $('.nav.w100.pad_2 a').map((index, a) => $(a).text()).get();
  const seed = $('.seed > b').text();
  const leech = $('.leech > b').text();
  const hash = $('#tor-hash').text();

  return { img, body, categories, seed, leech, hash };
};

// Parse categories
const parseCategories = (html, deep) => {
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

const parseCaptcha = (html) => {
  const $ = cheerio.load(html);
  return $('table.forumline .mrg_16 img').attr('src')
    ? {
      img: $('table.forumline .mrg_16 img').attr('src').replace('//', ''),
      capSid: $('input[name=cap_sid]').attr('value'),
      code: $('input[name=cap_sid] + input').attr('name'),
    }
    : null;
};

const parseUserInfo = (html) => {
  const $ = cheerio.load(html);
  const genderRegex = /(Мужской|Женский)/gm;
  const createDateRegex = /<b>([0-9]{4}-[0-9]{2}-[0-9]{2})<\/b>/gm;
  const expRegex = /<b>[ 0-9йфячіцувсмакепитрнгоьблшщдюжзїє]*<\/b>/gm;

  return $('#main_content')
    ? {
      username: $('#main_content_wrap > h1.pagetitle')
      .text()
      .replace(/\n/g, '')
      .replace(/\t/g, '')
      .replace(/^.*: (.*).*$/g, `$1`),
      img: $('#avatar-img img').attr('src') ? `https:${$('#avatar-img img').attr('src')}` : null,
      role: translate[$('#role').find('b').eq(1).textContent],
      country: translate[$('.user_details .med img').attr('title')],
      gender: translate[html.match(genderRegex).filter(Boolean)[0]] || 'N/A',
      experience: html.replace(/\n/g, '').replace(/\t/g, '').match(expRegex)[0].replace('<b>', '').replace('</b>', ''),
      createDate: formatCreateDate(html.match(createDateRegex)[0].replace('<b>', '').replace('</b>', '')) || 'N/A',
    }
    : null;
};

const parseStats = (html) => {
  const $ = cheerio.load(html);
  const size = $('#board_stats_wrap .med')
  .find('p')
  .eq(1)
  .find('b')
  .eq(2)
  .text();
  return {
    users: Number(
      $('#board_stats_wrap .med')
      .find('p')
      .eq(0)
      .find('b')
      .eq(0)
      .html()
      .replace(/,/g, ''),
    ),
    torrents: Number(
      $('#board_stats_wrap .med')
      .find('p')
      .eq(1)
      .find('b')
      .eq(0)
      .html()
      .replace(/,/g, ''),
    ),
    live: Number(
      $('#board_stats_wrap .med')
      .find('p')
      .eq(1)
      .find('b')
      .eq(1)
      .html()
      .replace(/,/g, ''),
    ),
    size: {
      value: Number(size.match(/([0-9.]*)/g)[0]),
      measure: size.match(/([a-zA-Z]*)$/g)[0],
    },
    peer: Number(
      $('#board_stats_wrap .med')
      .find('p')
      .eq(2)
      .find('b')
      .eq(0)
      .html()
      .replace(/,/g, ''),
    ),
    seed: Number($('#board_stats_wrap .seedmed').text().replace(/,/g, '')),
    leech: Number($('#board_stats_wrap .seedmed').text().replace(/,/g, '')),
  };
};

module.exports = {
  parsePageInfo,
  parseSearch,
  parseFullInfo,
  parseCategories,
  parseCaptcha,
  parseUserInfo,
  parseStats,
};
