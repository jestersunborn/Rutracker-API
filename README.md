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
