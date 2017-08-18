# rutracker-api
This is a fork of https://github.com/nikityy/Rutracker-API with little bit more functionality.


## Installing:

```
npm i rutracker-api-2
```
or use this if you want to include the `rutracker-api-2` inside of the dependencies section of your `package.json`
```
npm i rutracker-api-2 --save
```

## Using:

First of all you need to require `rutracker-api-2`:

```
const RutrackerAPI = require('rutracker-api-2');
```

Then you need to be logged in:

```
const username = 'username';
const password = 'password';

const rutracker = new RutrackerAPI({ username, password });

// or using login method
const rutracker = new RutrackerAPI();
rutracker.login(username, password);
```

If login was success:
```
rutracker.addListener('login', () => {
  // code
});
```

If username or email was wrong:
```
rutracker.addListener('login-error', () => {
  // code
});
```

If there is some problem with server:
```
rutracker.addListener('error', () => {
  // code
});
```

## Events:

`login` - user was logged in

`login-error` - username or email is wrong

`error` - problem with server


## API:

#### Search by query:
```
rutracker.search(query: String, callback: function(response));
```
```
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

```
rutracker.search('Inception', (res) => {
  console.log(res);
  /*

  */
})
```

If you want to get simple HTML, you need to use this part of code:
```
rutracker.parseData = false;
```

#### Download:
```
rutracker.download(id: String, callback: function(response));
```
```
// id - id of torrent
// callback - function which will be called after getting the results from server and those results will be provided inside this function
// response - FileReadableStream
```


#### Getting full info about torrent:

```
rutracker.getFullInfo(id: String, callback: function(response));
```
```
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
```
rutracker.getCategories(callback: function(response));
```
```
// callback - function which will be called after getting the results from server and those results will be provided inside this function
// response:
[{
  name: String,
  subCategories: [{ ... }]
}]
```
