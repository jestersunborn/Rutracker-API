import Promise from 'promise-polyfill';
import http from 'http';
import querystring from 'querystring';
import cheerio from 'cheerio';
import windows1251 from 'windows-1251';

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
const parseSearch = (html, host) => {
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
const parseFullInfo = (html) => {
  const $ = cheerio.load(html);
  const img = $('var.postImg').attr('title');
  const body = $('.post_body .post-font-serif1').text();
  const categories = $('.nav.w100.pad_2 a').map((index, a) => $(a).text()).get();
  return { img, body, categories };
};

class RutrackerApi {
  constructor() {
    this.host = 'rutracker.org';
    this.loginPath = '/forum/login.php';
    this.searchPath = '/forum/tracker.php';
    this.downloadPath = '/forum/dl.php';
    this.fullPath = '/forum/viewtopic.php';
    this.cookie = null;
  }

  // Login method
  login(username, password) {
    return new Promise((resolve, reject) => {
      // User data
      const postData = querystring.stringify({
        login_username: username || this.username,
        login_password: password || this.password,
        login: 'Вход',
      });

      const options = {
        hostname: this.host,
        port: 80,
        path: this.loginPath,
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': postData.length,
        },
      };

      const req = http.request(options, (res) => {
        if (res.statusCode.toString() === '302') {
          this.cookie = res.headers['set-cookie'][0];
          resolve();
        } else {
          reject();
        }
      });

      req.on('error', (err) => { reject(err); });
      req.write(postData);
      req.end();
    });
  }

  // Search
  search(q) {
    return new Promise((resolve, reject) => {
      if (typeof this.cookie !== 'string') {
        reject(new Error('Unauthorized: Use `login` method first'));
      } else if (typeof q === 'undefined') {
        reject(new Error('Expected at least one argument'));
      }
      const query = encodeURIComponent(q);
      const path = `${this.searchPath}?nm=${query}`;

      const options = {
        hostname: this.host,
        port: 80,
        path,
        method: 'POST',
        headers: { Cookie: this.cookie },
      };

      const req = http.request(options, (res) => {
        if (res.statusCode.toString() === '200') {
          let data = '';
          res.setEncoding('binary');
          res.on('data', (x) => {
            data += windows1251.decode(x, { mode: 'html' });
          });
          res.on('end', () => {
            resolve(parseSearch(data, this.host));
          });
        } else {
          reject(new Error(res.statusCode));
        }
      });
      req.on('error', (err) => { reject(err); });
      req.end();
    });
  }

  // Download
  download(id) {
    return new Promise((resolve, reject) => {
      if (typeof this.cookie !== 'string') {
        reject(new Error('Unauthorized: Use `login` method first'));
      } else if (typeof id === 'undefined') {
        reject(new Error('Expected at least one argument'));
      }
      const path = `${this.downloadPath}?t=${id}`;

      const options = {
        hostname: this.host,
        port: 80,
        path,
        method: 'GET',
        headers: { Cookie: this.cookie },
      };

      const req = http.request(options, (res) => {
        if (res.statusCode.toString() === '200') {
          resolve(res);
        } else {
          reject(new Error(`HTTP code is ${res.statusCode}`));
        }
      });

      req.on('error', (err) => { reject(err); });
      req.end();
    });
  }

  getFullInfo(id) {
    return new Promise((resolve, reject) => {
      if (!id) {
        reject(new Error('Provide an ID, please'));
      }
      const path = `${this.fullPath}?t=${id}`;
      const options = {
        hostname: this.host,
        port: 80,
        path,
        method: 'POST',
        headers: { Cookie: this.cookie },
      };

      const req = http.request(options, (res) => {
        if (res.statusCode.toString() === '200') {
          let data = '';
          res.setEncoding('binary');
          res.on('data', (x) => {
            data += windows1251.decode(x, { mode: 'html' });
          });
          res.on('end', () => {
            resolve(parseFullInfo(data));
          });
        } else {
          reject(new Error(res.statusCode));
        }
      });
      req.on('error', (err) => { reject(err); });
      req.end();
    });
  }
}

export default RutrackerApi;
