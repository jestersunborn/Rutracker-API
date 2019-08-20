const { request } = require('http');
const { stringify } = require('querystring');
const { decode } = require('windows-1251');

const {
  HOST,
  LOGIN_PATH,
  SEARCH_PATH,
  DOWNLOAD_PATH,
  FULL_INFO_PATH,
  INDEX_PATH,
  USER_PATH,
} = require('./config');

const {
  parsePageInfo,
  parseSearch,
  parseFullInfo,
  parseCategories,
  parseCaptcha,
  parseUserInfo,
  parseStats,
} = require('./lib/parsers');

const SortType = {
  DATE: 'date',
  DOWNLOADS: 'downloads',
  LEECHS: 'leechs',
  SEEDS: 'seeds',
  SIZE: 'size',
  TITLE: 'title',
};

class RutrackerApi {
  constructor(optCookie) {
    this.cookie = optCookie;
    this.captcha = undefined;
    this.query = undefined;
    this.direction = undefined;
    this.by = undefined;
  }

  getCaptcha() {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: HOST,
        port: 80,
        path: LOGIN_PATH,
        method: 'GET',
        headers: {},
      };

      const req = request(options, (res) => {
        if (res.statusCode.toString() === '200') {
          let data = '';
          res.setEncoding('binary');
          res.on('data', (x) => {
            data += decode(x, { mode: 'html' });
          });
          res.on('end', () => {
            const captcha = parseCaptcha(data);
            this.captcha = captcha;
            resolve(captcha);
          });
        } else {
          reject(new Error(res.statusCode));
        }
      });
      req.on('error', (err) => { reject(err); });
      req.end();
    });
  }

  setCookie(cookie) {
    return new Promise((resolve, reject) => {
      try {
        this.cookie = cookie;
        resolve();
      } catch (e) {
        reject(e);
      }
    });
  }

  // Login method
  login(username, password, optAnswer) {
    return new Promise((resolve, reject) => {
      // User data
      const postData = optAnswer
        ? stringify({
            login_username: username,
            login_password: password,
            login: 'Вход',
            cap_sid: this.captcha.capSid,
            [this.captcha.code]: optAnswer,
          })
        : stringify({
            login_username: username,
            login_password: password,
            login: 'Вход',
          });

      const options = {
        hostname: HOST,
        port: 80,
        path: LOGIN_PATH,
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': postData.length,
        },
      };

      const req = request(options, (res) => {
        if (res.statusCode.toString() === '302') {
          this.cookie = res.headers['set-cookie'][0];
          resolve(res.headers['set-cookie'][0]);
        } else {
          reject(`Error with status: ${res.statusCode}`);
        }
      });

      req.on('error', (err) => { reject(err); });
      req.write(postData);
      req.end();
    });
  }

  // Fetching all pages with results
  fetchPagination(count, id) {
    return Array(count)
      .fill(false)
      .map((_, index) => new Promise((resolve, reject) => {
        const query = encodeURIComponent(this.query);

        const path = `${SEARCH_PATH}?search_id=${id}&start=${index * 50}&nm=${query}`;
        const options = {
          hostname: HOST,
          port: 80,
          path,
          method: 'POST',
          headers: { Cookie: this.cookie },
        };
        const req = request(options, (res) => {
          if (res.statusCode.toString() === '200') {
            let data = '';
            res.setEncoding('binary');
            res.on('data', (x) => {
              data += decode(x, { mode: 'html' });
            });
            res.on('end', () => {
              const parsed = parseSearch(data, HOST);
              const sorted = this._sortBy(parsed, this.by, this.direction);
              resolve(sorted);
            });
          } else {
            reject(new Error(res.statusCode));
          }
        });
        req.on('error', (err) => { reject(err); });
        req.end();
      }),
    );
  }

  // Search
  search(q, by, direction) {
    this.query = q;
    this.direction = direction;
    this.by = by;
    return new Promise((resolve, reject) => {
      if (typeof this.cookie !== 'string') {
        reject(new Error('Unauthorized: Use `login` method first'));
      } else if (typeof q === 'undefined') {
        reject(new Error('Expected at least one argument'));
      }
      const query = encodeURIComponent(q);
      const path = `${SEARCH_PATH}?nm=${query}`;

      const options = {
        hostname: HOST,
        port: 80,
        path,
        method: 'POST',
        headers: { Cookie: this.cookie },
      };

      const req = request(options, (res) => {
        if (res.statusCode.toString() === '200') {
          let data = '';
          res.setEncoding('binary');
          res.on('data', (x) => {
            data += decode(x, { mode: 'html' });
          });
          res.on('end', () => {
            const { count, id } = parsePageInfo(data, HOST);

            Promise.all(this.fetchPagination(count, id))
              .then(res => res.reduce((acc, c) => [...acc, ...c], []))
              .then(resolve)
              .catch(reject);
          });
        } else {
          reject(new Error(res.statusCode));
        }
      });
      req.on('error', reject);
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
      const path = `${DOWNLOAD_PATH}?t=${id}`;

      const options = {
        hostname: HOST,
        port: 80,
        path,
        method: 'GET',
        headers: { Cookie: this.cookie },
      };

      const req = request(options, (res) => {
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

  getFullFileInfo(id) {
    return new Promise((resolve, reject) => {
      if (!id) {
        reject(new Error('Provide an ID, please'));
      }
      const path = `${FULL_INFO_PATH}?t=${id}`;
      const options = {
        hostname: HOST,
        port: 80,
        path,
        method: 'POST',
        headers: { Cookie: this.cookie },
      };

      const req = request(options, (res) => {
        if (res.statusCode.toString() === '200') {
          let data = '';
          res.setEncoding('binary');
          res.on('data', (x) => {
            data += decode(x, { mode: 'html' });
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

  getCategories(deep) {
    return new Promise((resolve, reject) => {
      const path = `${INDEX_PATH}`;
      const options = {
        hostname: HOST,
        port: 80,
        path,
        method: 'POST',
        headers: { Cookie: this.cookie },
      };
      const req = request(options, (res) => {
        if (res.statusCode.toString() === '200') {
          let data = '';
          res.setEncoding('binary');
          res.on('data', (x) => {
            data += decode(x, { mode: 'html' });
          });
          res.on('end', () => {
            resolve(parseCategories(data, deep));
          });
        } else {
          reject(new Error(res.statusCode));
        }
      });
      req.on('error', (err) => { reject(err); });
      req.end();
    });
  }

  getUserInfo(userId) {
    return new Promise((resolve, reject) => {
      const path = `${USER_PATH}?mode=viewprofile&u=${userId}`;
      const option = {
        hostname: HOST,
        port: 80,
        method: 'GET',
        headers: { Cookie: this.cookie },
        path,
      };

      const req = request(option, (res) => {
        if (res.statusCode.toString() === '200') {
          let data = '';
          res.setEncoding('binary');
          res.on('data', (x) => {
            data += decode(x, { mode: 'html' });
          });
          res.on('end', () => {
            resolve(parseUserInfo(data));
          });
        } else {
          reject(new Error(res.statusCode));
        }
      });
      req.on('erorr', reject);
      req.end();
    });
  }

  getStats() {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: HOST,
        port: 80,
        path: INDEX_PATH,
        method: 'GET',
        headers: { Cookie: this.cookie },
      };
      const req = request(options, (res) => {
        if (res.statusCode.toString() === '200') {
          let data = '';
          res.setEncoding('binary');
          res.on('data', (x) => {
            data += decode(x, { mode: 'html' });
          });
          res.on('end', () => {
            resolve(parseStats(data));
          });
        } else {
          reject(new Error(res.statusCode));
        }
      });
      req.on('error', (err) => { reject(err); });
      req.end();
    });
  }

  _sortBy(data, by, direction) {
    switch (by) {
      case SortType.SIZE:
      case SortType.SEEDS:
      case SortType.LEECHS:
      case SortType.DOWNLOADS:
        return direction
          ? data.sort((a, b) => a[by] - b[by])
          : data.sort((a, b) => b[by] - a[by]);
      case SortType.DATE:
        return direction
          ? data.sort((a, b) => a.uploadDate > b.uploadDate ? 1 : -1)
          : data.sort((a, b) => a.uploadDate > b.uploadDate ? -1 : 1);
      case SortType.TITLE:
        return direction
          ? data.sort((a, b) => a.title > b.title ? -1 : 1)
          : data.sort((a, b) => a.title > b.title ? 1 : -1);
      default:
        return data;
    }
  }
}

module.exports = RutrackerApi;
