import Credentials from '../src/credentials.js';
import RawSession from '../src/rawSession.js';
import { SESSION_SERVER_URLS } from '../src/config.js';
import * as config from '../config.js';

let credentials = new Credentials();
credentials.username = config.username;
credentials.password = config.password;

let rawSession = new RawSession(SESSION_SERVER_URLS[0], credentials);

credentials.login()
  .then(() => rawSession.connect())
  .catch(err => {
    console.log(err.stack);
  });
