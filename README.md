# rutracker-api
This is a fork of [Nikita Gusarov Rutracker-API](https://github.com/nikityy/Rutracker-API) with little bit more functionality.


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

const rutracker = new RutrackerAPI(username, password, parseData);

// or using login method
const rutracker = new RutrackerAPI(null, null, parseData);
rutracker.login(username, password);
```

If you want to get simple HTML, you need to use this part of code:
```javascript
const rutracker = new RutrackerAPI(username, password, false);
```

If login was success:
```javascript
rutracker.addListener('login-success', () => {
  // code
});
```

If username or email was wrong:
```javascript
rutracker.addListener('login-error', () => {
  // code
});
```

If there is some problem with server:
```javascript
rutracker.addListener('error', () => {
  // code
});
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

## Events:

`login-success` - user was logged in

`login-error` - username or email are wrong

`error` - problem with server


## API:

#### Search by query:
```javascript
rutracker.search(query: String, callback: function(response));
```
```javascript
// query - String with query
// callback - function which will be called after getting the results from server and those results will be provided inside this function
// response:
[{
  state: String,
  id: String
  category: String,
  title: String,
  author: String,
  size: String,
  seeds: String,
  leechs: String,
  url: String
}]
```

Simple usage:

```javascript
rutracker.search('Inception', (res) => {
  console.log(res);
})
```

#### Download:
```javascript
rutracker.download(id: String, callback: function(response));
```
```javascript
// id - id of torrent
// callback - function which will be called after getting the results from server and those results will be provided inside this function
// response - FileReadableStream
```


#### Getting full info about torrent:

```javascript
rutracker.getFullInfo(id: String, callback: function(response));
```
```javascript
// id - id of torrent
// callback - function which will be called after getting the results from server and those results will be provided inside this function
// response:
{
  img: String, // url to poster
  content: String, // Full description with some html tags
  categories: [String]
}
```

#### Getting categories:
```javascript
rutracker.getCategories(callback: function(response));
```
```javascript
// callback - function which will be called after getting the results from server and those results will be provided inside this function
// response:
[{
  name: String,
  subCategories: [{ ... }]
}]
```

## Short API:
```javascript
rutracker.login(username: String, password: String);
```
```javascript
rutracker.search(query: String, callback: function(response));
```
```javascript
rutracker.download(id: String, callback: function(response));
```
```javascript
rutracker.getFullInfo(id: String, callback: function(response));
```
```javascript
rutracker.getCategories(callback: function(response));
```

## Build:

```bash
npm run build
```
