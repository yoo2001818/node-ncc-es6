import request from 'request-promise';
import { CookieJar } from 'tough-cookie';
import { EventEmitter } from 'events';
import encryptKey from './loginEncrypt.js';
import { CHAT_HOME_URL } from './config.js';
import debug from 'debug';

const log = debug('ncc:credentials');

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

class Credentials extends EventEmitter {
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
      log('Received already existing cookie jar; deserializing');
      this.cookieJar = CookieJar.deserializeSync(cookieJar);
    } else {
      log('Creating new cookie jar');
      this.cookieJar = new CookieJar();
    }
    log('Hooking cookie jar');
    hookCookieJar(this.cookieJar);
  }
  getCookieJar() {
    return this.cookieJar.serializeSync();
  }
  validateLogin() {
    log('Validating login status');
    return request({
      url: CHAT_HOME_URL,
      jar: this.cookieJar,
      strictSSL: false,
      resolveWithFullResponse: true
    })
    .then(response => {
      if (response.request.uri.href.indexOf('nidlogin.login?') !== -1) {
        log('Not logged in; rejecting promise');
        return Promise.reject();
      } else {
        let pattern = /var g_sUserId = "([^'\n]+)";/;
        let matched = pattern.exec(response.body);
        log('Logged in as %s; resolving promise', matched[1]);
        return Promise.resolve(matched[1]);
      }
    });
  }
  login() {
    log('Starting logging in');
    // Empty cookie jar
    log('Creating new cookie jar');
    this.cookieJar = new CookieJar();
    hookCookieJar(this.cookieJar);
    log('Receiving RSA encryption key');
    // Fetch RSA login key from the server
    return request('http://static.nid.naver.com/enclogin/keys.nhn')
    .then(keyString => {
      // Encrypt key
      const { keyName, key } =
        encryptKey(keyString, this.username, this.password);
      let form = {
  	    enctp: 1,
  	    encnm: keyName,
  	    svctype: 0,
  	    'enc_url': 'http0X0.0000000000001P-10220.0000000.000000www.naver.com',
  	    url: 'www.naver.com',
  	    'smart_level': 1,
  	    encpw: key
      };
	  if(this.captcha){
	    form.smart_LEVEL = -1;
		f.chptcha = this.captcha; // Not a typo; Naver uses CHptcha
		f.chptchakey = this.captchaKey;
		f.captcha_type = 'image'; // but in this case Naver uses CAptcha
	  }
      log('Sending encrypted login request');
      // Send login request
      return request({
        url: 'https://nid.naver.com/nidlogin.login',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'text/plain'
        },
        method: 'POST',
        form: form,
        jar: this.cookieJar
      });
    })
    .then(body => {
      let cookieText = this.cookieJar.getCookieString('https://nid.naver.com/',
        {});
      if (cookieText.indexOf('NID_AUT') !== -1) {
        log('Successfully logged in');
        this.emit('login');
        return Promise.resolve();
      } else {
		let captcha = body.match(/<img id="captchaimg"[\s\S]+?>/im) || ""; // Parse captcha image if it exists
		
        log('Failed to log in');
        return Promise.reject('Invalid username or password\n' + captcha);
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
    log('Logging out');
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

export default Credentials;
