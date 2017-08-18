import http from 'http';
import querystring from 'querystring';
import cheerio from 'cheerio';
import windows1251 from 'windows-1251';
import EventEmitter from 'events';

const formatSize = (sizeInBytes) => {
  const sizeInMegabytes = `${sizeInBytes / (1000 * 1000 * 1000)}`;
  return `${sizeInMegabytes.slice(0, 4)} GB`;
};


class RutrackerApi extends EventEmitter {
  constructor(username, password, parseData = true) {
    super();
    this.username = username;
    this.password = password;
    this.host = 'rutracker.org';
    this.loginPath = '/forum/login.php';
    this.searchPath = '/forum/tracker.php';
    this.downloadPath = '/forum/dl.php';
    this.fullPath = '/forum/viewtopic.php';
    this.cookie = null;
    this.parseData = parseData;

    this.login(username, password);
  }

  // Login method
  login(username, password) {
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
        this.emit('login-success');
      } else {
        this.emit('login-error');
      }
    });

    req.on('error', (err) => { this.emit('error', err); });
    req.write(postData);
    req.end();
  }

  // Search
  search(q, cb = () => {}) {
    console.log(q);
    if (typeof this.cookie !== 'string') {
      throw Error('Unauthorized: Use `login` method first');
    } else if (typeof q === 'undefined') {
      throw TypeError('Expected at least one argument');
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
          if (this.parseData === true) {
            this.parseSearch(data, cb);
          } else {
            cb(data);
          }
        });
      } else {
        throw Error(`HTTP code is ${res.statusCode}`);
      }
    });
    req.on('error', (err) => { this.emit('error', err); });
    req.end();
  }

  // Download
  download(id, cb = () => {}) {
    if (typeof this.cookie !== 'string') {
      throw Error('Unauthorized: Use `login` method first');
    } else if (typeof id === 'undefined') {
      throw TypeError('Expected at least one argument');
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
        cb(res);
      } else {
        throw Error(`HTTP code is ${res.statusCode}`);
      }
    });

    req.on('error', (err) => { this.emit('error', err); });
    req.end();
  }

  // Parse search results
  parseSearch(html, cb) {
    const $ = cheerio.load(html, { decodeEntities: false });
    let tracks = $('#tor-tbl tbody').find('tr');
    let results = [];
    const length = tracks.length;

    // TODO: refactor this shit
    for (let i = 0; i < length; i += 1) {
      const document = tracks.find('td');
      const state = document.next();
      const category = state.next();
      const title = category.next();
      const author = title.next();
      const size = author.next();
      const seeds = size.next();
      const leechs = seeds.next();

      results.push({
        state: state.attr('title'),
        id: title.find('div a').attr('data-topic_id'),
        category: category.find('.f-name a').html(),
        title: title.find('div a ').html(),
        author: author.find('div a ').html(),
        size: formatSize(size.find('*').html()),
        seeds: seeds.find('b').html(),
        leechs: leechs.find('b').html(),
        url: `http://${this.host}/forum/${title.find('div a').attr('href')}`,
      });
      tracks = tracks.next();
    }

    // Handle case where search has no results
    results = results.filter(x => typeof x.id !== 'undefined');

    if (cb) {
      return cb(results);
    }
    return results;
  }
}

export default RutrackerApi;
