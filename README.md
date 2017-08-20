# rutracker-api
> This is a fork of [Nikita Gusarov Rutracker-API](https://github.com/nikityy/Rutracker-API) with little bit more functionality.

* [Installing](https://github.com/jestersunborn/rutracker-api#installing)
* [Using](https://github.com/jestersunborn/rutracker-api#using)
* [Testing](https://github.com/jestersunborn/rutracker-api#testing)
* [API](https://github.com/jestersunborn/rutracker-api#api)
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

rutracker.getCaptcha()
  .then((res) => {
    // do something with response
    /*{
      img: String,
      code: String,
      capSid: String
    }*/
  })
  .then(() => rutracker.login(username, password, answer))
  .then(() => console.log('Wow, cool. You are logged in!'))
  .then(() => rutracker.search('Inception'))
  .then((res) => console.log(res))
  .catch((err) => console.error('Hmm, bad. Something wrong :('))
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
  date: {
    day: String, // 1-31
    month: String, // Jan - Dec
    year: String, // YYYY
  }
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

#### .getFullInfo(id: String);
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
rutracker.getFullInfo('12345')
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

#### .logout();
> use this method for clear cookies, this method will return Promise;


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
.getFullInfo(id: String): Promise;
```
```javascript
.getCategories(deep: Boolean): Promise;
```
```javascript
.logout(): Promise;
```

## Build:

```bash
npm run build
```
or to run with watcher
```bash
npm start
```
