import Credentials from '../src/credentials.js';
import * as config from '../config.js';

let credentials = new Credentials();
credentials.username = config.username;
credentials.password = config.password;

credentials.validateLogin()
  .then(username => {
    console.log(username);
  }, err => {
    console.log('nope', err);
  });
