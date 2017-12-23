# rutracker-api
> This is a fork of [Nikita Gusarov Rutracker-API](https://github.com/nikityy/Rutracker-API) with little bit more functionality.

Watch on npm: [rutracker-api-2](https://www.npmjs.com/package/rutracker-api-2)

* [Installing](https://github.com/jestersunborn/rutracker-api#installing)
* [Using](https://github.com/jestersunborn/rutracker-api#using)
* [Testing](https://github.com/jestersunborn/rutracker-api#testing)
* [API](https://github.com/jestersunborn/rutracker-api#api)
  * [.login(username: String, password: String, answer: String)](https://github.com/jestersunborn/rutracker-api#loginusername-string-password-string-answer-string)
  * [.getCaptcha()](https://github.com/jestersunborn/rutracker-api#getcaptcha)
  * [.search(query: String, sortBy: String, direction: Boolean)](https://github.com/jestersunborn/rutracker-api#searchquery-string-sortby-string-direction-boolean)
  * [.download(id: String)](https://github.com/jestersunborn/rutracker-api#downloadid-string)
  * [.getFullFileInfo(id: String)](https://github.com/jestersunborn/rutracker-api#getfullfileinfoid-string)
  * [.getCategories(deep: Boolean)](https://github.com/jestersunborn/rutracker-api#getcategoriesdeep-boolean)
  * [.getUserInfo(id: String)](https://github.com/jestersunborn/rutracker-api#getuserinfoid-string)
  * [.getStats()](https://github.com/jestersunborn/rutracker-api#getstats)
* [Short API](https://github.com/jestersunborn/rutracker-api#short-api)
* [Build](https://github.com/jestersunborn/rutracker-api#build)

## Installing:

```bash
npm install rutracker-api-2
```
or use this if you want to include the `rutracker-api-2` inside of the dependencies section of your `package.json`
```bash
npm install rutracker-api-2 --save
```


## Using:

First of all you need to require `rutracker-api-2`:

```javascript
const RutrackerAPI = require('rutracker-api-2');
```

Then you need to be logged in:

```javascript
const username = 'username';
const password = 'password';

const rutracker = new RutrackerAPI();

rutracker.login(username, password)
  .then((cookie) => {
    // you can save the cookie to use them later
    // ...
  })
  .then(() => rutracker.search('Inception', 'size', true)) // Searching for Inception, sorted by size from min to max
  .then((results) => console.log(results))
  .catch((err) => {
    // Something wrong
  });

// If login of password are wrong you need to enter the captcha
rutracker.getCaptcha()
  .then((captcha) => {
    // You will get the object like this
    /*{
      img: String,
      code: String,
      capSid: String
    }*/
  })
  .then(() => rutracker.login(username, password, answer))
  .then(() => {
    // code
  })
  .catch((err) => {
    // If you do not need a captcha
  })

// If you made login once, and now you do not want to do login again, you can use previous cookie

const cookie = getSavedCookieFromSomewhere();

const rutracker = new RutrackerAPI(cookie);

// And now you can start using other methods
rutracker.search('Inception', 'date', false)
  .then((results) => {
    console.log(results);
  })
  .catch((err) => {
    console.error(err);
  })
```

## Testing:
First of all you need to enter you `username` and `password` from rutracker in `./test/config.json` file
```json
{
  "username": "username",
  "password": "********"
}
```

after that run npm test command
```bash
npm test
```

## API:

#### .login(username: String, password: String, answer: String);
return Promise with response:
```javascript
  cookie: String
```

`answer` - answer for captcha (optional);

Simple usage:
```javascript
const rutracker = new RutrackerAPI();

const username = 'username';
const password = 'password';

// 1
rutracker.login(username, password)
  .then(cookie => console.log(cookie))
  .catch(err => console.error(err));

// 2
rutracker.getCaptcha()
  .then(({ img, capSid, code }) => { // You do not need to use capSid and code in most of cases
    const answer = getAnswerForCaptchaFromSomewhere(img);
    return rutracker.login(username, password, answer)
  })
  .then(cookie => console.log(cookie))
  .catch(err => console.error(err)); // If you do not need for a captcha
```

#### .getCaptcha();
return Promise with response:
```javascript
{
  img: String, // img with captcha
  capSid: String, // cap_sid fields for request
  code: String, // e.g. 'cap_code_e793560e065d593438e45cf00b5c434f'
}
```

#### .search(query: String, sortBy: String, direction: Boolean);
return Promise with response:

```javascript
[{
  id: String
  status: String,
  title: String,
  author: String,
  category: {
    id: String,
    name: String
  },
  size: Number,
  seeds: Number,
  leechs: Number,
  downloads: Number,
  uploadDate: Date,
  url: String
}]
```

`sortBy` can be:
* `'size'`
* `'date'`
* `'title'`
* `'seeds'`
* `'leechs'`
* `'downloads'`

`direction` - from min to max if `true`

Status can be:
 * `'approved'`
 * `'doubtfully'`
 * `'not-approved'`
 * `'temporary'`

Simple usage:

```javascript
rutracker.search('Inception', 'size', true)
  .then((res) => {
    console.log(res); // All matching by 'Inception' sort by 'size' from min to max
  })
  .catch((err) => console.error(err));
```

#### .download(id: String);
return Promise with response: `FileReadableStream`

Simple usage:

```javascript
rutracker.download('12345')
  .then((frs) => {
    console.log(frs);
  })
  .catch((err) => console.error(err));
```

#### .getFullFileInfo(id: String);
return Promise with response:
```javascript
{
  img: String, // url to poster
  body: String, // Full description with some html tags
  categories: [{
    id: String,
    name: String
  }]
}
```

Simple usage:

```javascript
rutracker.getFullFileInfo('12345')
  .then((res) => {
    console.log(res);
  })
  .catch((err) => console.error(err));
```

#### .getCategories(deep: Boolean);
return Promise with response:
```javascript
// deep is false
[{
  id: String,
  name: String,
}]
// deep is true
[{
  id: String,
  name: String,
  subCategories: [{
    id: String,
    name: String,
    // ...
  }]
}]
```

Simple usage:

```javascript
rutracker.getCategories(deep) // deep - true or false
  .then((categories) => {
    console.log(categories);
  })
  .catch((err) => console.error(err));
```

#### .getUserInfo(id: String);
return Promise with response:
```javascript
{
  username: String,
  img: String,
  age: String,
  role: String,
  from: String,
  gender: String,
  experience: String,
  createDate: String,
}
```

Simple usage:

```javascript
rutracker.getUserInfo('1234567890')
  .then(console.log);
  })
  .catch(err => console.error('Something wrong!'));
```

#### .getStats();
return Promise with response:
```javascript
{
  users: Number,
  torrents: Number,
  live: Number,
  size: {
    value: Number,
    measure: String,
  },
  peer: Number,
  seed: Number,
  leech: Number,
}
```

Simple usage:

```javascript
// User should be logged in before you can use this method
rutracker.getStats()
  .then(console.log) // { users: 15286984, ..., size: { value: 3.46, measure: 'PB' }, ... }
  .catch(err => console.error('Something wrong!'));
```

## Short API:
```javascript
.login(username: String, password: String, answer: String): Promise;
```
```javascript
.getCaptcha(): Promise;
```
```javascript
.search(query: String, sortBy: String, direction: Boolean): Promise;
```
```javascript
.download(id: String): Promise;
```
```javascript
.getFullFileInfo(id: String): Promise;
```
```javascript
.getCategories(deep: Boolean): Promise;
```
```javascript
.getUserInfo(id: String): Promise;
```
```javascript
.getStats(): Promise;
```

## Build:

```bash
npm run build
```
or to run with watcher
```bash
npm start
```

## Help:

If you want to help me, you can do next:
1. Suggest for what page you want to see the API.
2. Fork the repo and add your own API.
3. Help me with translate to English:
  - [categories](https://github.com/jestersunborn/rutracker-api/blob/master/src/intl/categories.js)(`7.03%` translated)
  - choose the part of rutracker site and translate (fork `->` do `->` PR);
