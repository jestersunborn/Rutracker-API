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
