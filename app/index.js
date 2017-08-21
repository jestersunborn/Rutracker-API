import Promise from 'promise-polyfill';
import http from 'http';
import querystring from 'querystring';
import windows1251 from 'windows-1251';

import {
  parseSearch,
  parseFullInfo,
  parseCategories,
  sortBy,
  parseCaptcha,
} from './helpers';

class RutrackerApi {
  constructor(cookie) {
    this.host = 'rutracker.org';
    this.loginPath = '/forum/login.php'; // For login
    this.searchPath = '/forum/tracker.php'; // For search
    this.downloadPath = '/forum/dl.php'; // For download
    this.fullPath = '/forum/viewtopic.php'; // For gettings full content
    this.indexPath = '/forum/index.php'; // Fot categories
    this.cookie = cookie || null;
  }

  getCaptcha() {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: this.host,
        port: 80,
        path: this.loginPath,
        method: 'GET',
        headers: {},
      };

      const req = http.request(options, (res) => {
        if (res.statusCode.toString() === '200') {
          let data = '';
          res.setEncoding('binary');
          res.on('data', (x) => {
            data += windows1251.decode(x, { mode: 'html' });
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
  login(username, password, answer) {
    return new Promise((resolve, reject) => {
      // User data
      const postData = answer
        ? querystring.stringify({
            login_username: username,
            login_password: password,
            login: 'Вход',
            cap_sid: this.captcha.capSid,
            [this.captcha.code]: answer,
          })
        : querystring.stringify({
            login_username: username,
            login_password: password,
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

  // Search
  search(q, by, direction) {
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
            const parsed = parseSearch(data, this.host);
            const sorted = sortBy(parsed, by, direction);
            resolve(sorted);
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

  getCategories(deep) {
    return new Promise((resolve, reject) => {
      const path = `${this.indexPath}`;
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
}

export default RutrackerApi;
