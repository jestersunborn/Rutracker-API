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

const rutracker = new RutrackerAPI();

rutracker.login(username, password)
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

#### .search(query: String);
return Promise with response:

```javascript
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
rutracker.search('Inception')
  .then((res) => {
    console.log(res);
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
  content: String, // Full description with some html tags
  categories: [String]
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

#### .getCategories();
return Promise with response:
```javascript
[{
  name: String,
  subCategories: [{ ... }]
}]
```

Simple usage:

```javascript
rutracker.getCategories()
  .then((categories) => {
    console.log(categories);
  })
  .catch((err) => console.error(err));
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
