import Credentials from '../src/credentials.js';
import RawSession from '../src/rawSession.js';
import { SESSION_SERVER_URLS } from '../src/config.js';
import * as config from '../config.js';
import fs from 'fs';

let credentials = new Credentials(
  config.username,
  config.password
);
credentials.username = config.username;
credentials.password = config.password;

let rawSession = new RawSession(SESSION_SERVER_URLS[0], credentials);

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
  .then(() => rawSession.connect())
  .catch(err => {
    console.log(err.stack);
  });
