import request from 'request-promise';
import querystring from 'querystring';
import { CookieJar } from 'tough-cookie';
import { EventEmitter } from 'events';
import encryptKey from './loginEncrypt.js';
import { CHAT_HOME_URL } from './config.js';

function hookCookieJar(cookieJar) {
  // Request.js does some weird stuff.
  // ... Why am I doing this thing.
  cookieJar.setCookie = function(cookieOrStr, uri, options, syncCb) {
    if (syncCb) {
      return CookieJar.prototype.setCookie.apply(this, arguments);
    }
    return this.setCookieSync(cookieOrStr, uri, options || {});
  };
  cookieJar.getCookieString = function() {
    if (arguments[arguments.length - 1] instanceof Function) {
      return CookieJar.prototype.getCookieString.apply(this, arguments);
    }
    return this.getCookieStringSync.apply(this, arguments);
  };
  cookieJar.getCookies = function() {
    if (arguments[arguments.length - 1] instanceof Function) {
      return CookieJar.prototype.getCookies.apply(this, arguments);
    }
    return this.getCookiesSync.apply(this, arguments);
  };
}

export default class Credentials extends EventEmitter {
  constructor(username, password, cookieJar) {
    super();
    // TODO in-memory password encryption
    // Note that username/password should belong to cookieJar
    this.username = username;
    this.password = password;
    this.setCookieJar(cookieJar);
  }
  setCookieJar(cookieJar) {
    if (cookieJar != null) {
      this.cookieJar = CookieJar.deserializeSync(cookieJar);
    } else {
      this.cookieJar = new CookieJar();
    }
    hookCookieJar(this.cookieJar);
  }
  getCookieJar() {
    return this.cookieJar.serializeSync();
  }
  validateLogin() {
    return request({
      url: CHAT_HOME_URL,
      jar: this.cookieJar,
      strictSSL: false,
      resolveWithFullResponse: true
    })
    .then(response => {
      if (response.request.uri.href.indexOf('nidlogin.login?') !== -1) {
        return Promise.reject();
      } else {
        let pattern = /var g_sUserId = "([^'\n]+)";/;
        let matched = pattern.exec(response.body);
        return Promise.resolve(matched[1]);
      }
    });
  }
  login() {
    // Empty cookie jar
    this.cookieJar = new CookieJar();
    hookCookieJar(this.cookieJar);
    // Fetch RSA login key from the server
    return request('http://static.nid.naver.com/enclogin/keys.nhn')
    .then(keyString => {
      // Encrypt key
      const { keyName, key } =
        encryptKey(keyString, this.username, this.password);
      // Send login request
      return request({
        url: 'https://nid.naver.com/nidlogin.login',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'text/plain'
        },
        method: 'POST',
        form: {
          enctp: 1,
          encnm: keyName,
          svctype: 0,
          'enc_url':
            'http0X0.0000000000001P-10220.0000000.000000www.naver.com',
          url: 'www.naver.com',
          'smart_level': 1,
          encpw: key
        },
        jar: this.cookieJar
      });
    })
    .then(body => {
      let cookieText = this.cookieJar.getCookieString('https://nid.naver.com/',
        {});
      if (cookieText.indexOf('NID_AUT') !== -1) {
        this.emit('login');
        return Promise.resolve();
      } else {
        return Promise.reject('Invalid username or password');
      }
    })
    .catch(e => {
      this.emit('error', e);
      throw e;
    });
  }
  logout() {
    // Empty cookie jar
    this.cookieJar = new CookieJar();
    hookCookieJar(this.cookieJar);
    this.emit('logout');
    return Promise.resolve();
  }
  toJSON() {
    return {};
  }
  inspect() {
    return 'Credentials information';
  }
}
