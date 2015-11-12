import Credentials from '../src/credentials.js';
import Session from '../src/session.js';
import * as config from '../config.js';
import fs from 'fs';
import path from 'path';
import values from 'lodash.values';

let credentials = new Credentials(
  config.username,
  config.password
);
credentials.username = config.username;
credentials.password = config.password;

let session = new Session(credentials);

new Promise((resolve, reject) => {
  fs.readFile('../auth.json', 'utf8', (err, data) => {
    if (err) return reject(err);
    return resolve(data);
  });
})
  .then(JSON.parse, () => null)
  .then(cookieJar => credentials.setCookieJar(cookieJar))
  .then(() => credentials.validateLogin())
  .then(username => {
    console.log('Logged in with username', username);
  }, () => {
    console.log('Logging in');
    return credentials.login()
      .then(() => fs.writeFile('../auth.json',
        JSON.stringify(credentials.getCookieJar())));
  })
  .then(() => session.connect())
  .catch(err => {
    console.log(err.stack);
  });

session.on('error', (error) => {
  console.log(error);
});

session.on('message', message => {
  if (message.room.load === 2 && !message.room.loading) {
    session.syncRoom(message.room);
  }
  if (message.message == '!es6txt') {
    session.sendText(message.room, 'Hello, world!');
  }
  if (message.message == '!es6sticker') {
    session.sendSticker(message.room, 'moon_and_james-2');
  }
  if (message.message == '!es6image') {
    session.sendImage(message.room,
      fs.createReadStream(path.join(__dirname, 'imagetest.png')));
  }
  if (message.message == '!userList') {
    session.sendText(message.room,
      values(message.room.users).map(user => user.nickname).join(', '));
  }
  if (message.message.slice(0, 5) === '!node' &&
    message.user.id === session.username
  ) {
    // Meh. I'm too lazy.
    session.sendText(message.room, eval(message.message.slice(6)));
  }
});
