import request from 'request-promise';
import { CHAT_HOME_URL } from './config.js';
import { EventEmitter } from 'events';

// Server API endpoint
// There's 'close' too, but I don't think I'll need it.
// If anyone needs it, feel free to open an issue
export const POLL_URL = '/poll.nhn';
export const CONNECT_URL = '/conn.nhn';

// Time related config
export const TIME_CONFIG = {
  POLLING_TIMEOUT: 20,
  CONN_TIMEOUT: 3,
  POLL_RETRY_LIMIT_CNT: 3,
  CONN_RETRY_LIMIT_CNT: 10,
  POLL_SLEEP_DELAY: 1000,
  CONN_SLEEP_DELAY: 500,
  CONN_SLEEP_MAX_DELAY: 3000,
};

// Device type enums
export const DEVICE_TYPE = {
  WEB: 2001
};

export const RESULT_CODE = {
  HTTP_SUCCESS: 200,
  CMD_SUCCESS: 0,
  POLLING_RE_CONN: 204,
  ERR_INTERNAL_ERROR: 102,
  ERR_INVALID_PARAMETER: 105,
  ERR_INVALID_SESSION: 201,
  ERR_SESSION_NOT_FOUND: 202,
  ERR_SESSION_CONFLICT: 203,
  ERR_EXPIRED_COOKIE: 302,
  CONN_RESP: 10100
};

function getCallbackFn() {
  // Mimic Jindo's behaviour
  return 'window.__jindo2_callback._' + (Math.floor(Math.random() * 900 + 100));
}

// Extract from JSONP data
function extractResponse(body) {
  // Or we could use regular expression..
  const unpacked = body.slice(body.indexOf('"') + 1, body.lastIndexOf('"'));
  // This breaks Korean text... Not sure why though.
  const decrypted = new Buffer(unpacked, 'base64').toString('utf8');
  return JSON.parse(decrypted);
}

// validate response...
const validateResponse = message => {
  // Error will be thrown by request-promise if status code is not 200
  // This means we don't have to check status code (We can't check it anyway)
  if (message.retCode !== RESULT_CODE.CMD_SUCCESS) {
    throw message;
  }
  return message.bdy;
};

/**
 * Low-level session object to communicate with the chat server
 */
export default class RawSession extends EventEmitter {
  constructor(server, credentials) {
    super();
    /**
     * The chat server's URL address. Should not end with '/'.
     * @type {String}
     */
    this.server = server;
    /**
     * The credentials information used to connect to the server.
     * @type {Credentials}
     */
    this.credentials = credentials;
    this.username = null;
    this.sid = null;
    // And tons of internal variables
    this.connected = false;
  }
  connect(retries = 0, err) {
    if (retries >= TIME_CONFIG.CONN_RETRY_LIMIT_CNT) {
      // Connection failed. Tata!
      if (err.stack) {
        this.emit('error', err);
        throw err;
      }
      if (err.retMsg) {
        this.emit('error', new Error(err.retMsg));
        throw new Error(err.retMsg);
      }
      this.emit('error', new Error(err));
      throw new Error(err);
    }
    if (this.connected) return Promise.reject('Already connected');
    // Recreate request object here because of cookieJar object
    this.request = request.defaults({
      jar: this.credentials.cookieJar,
      // TODO test connection without it?
      strictSSL: false,
      headers: {
        'Content-Type': 'application/json; charset=UTF-8',
        'Referer': CHAT_HOME_URL
      },
      timeout: TIME_CONFIG.POLLING_TIMEOUT * 1000
    });
    return this.request({
      url: this.server + CONNECT_URL,
      qs: {
        'callback_fn': getCallbackFn(),
        uid: this.credentials.username,
        tid: +new Date(),
        devType: DEVICE_TYPE.WEB,
        crypto: false
      }
    })
    .then(extractResponse)
    .then(validateResponse)
    .then(body => {
      // Why the server is sending AES encryption information? ...
      // Anyway, we've got the session id at this point if we don't have
      // an error.
      this.sid = body.sid;
      this.username = this.credentials.username;
      this.connected = true;
      this.emit('connect');
      // Start polling
      return this.schedulePoll();
    }, message => {
      console.log(message);
      // Strangely, server sends 'invalid parameter' if cookie is missing
      if (message.retCode === RESULT_CODE.ERR_EXPIRED_COOKIE ||
        message.retCode === RESULT_CODE.ERR_INVALID_PARAMETER) {
        // Relogin is required :/
        return this.credentials.login()
          .then(() => this.connect(retries + 1, message));
      }
      // Retry login
      // TODO wait for retry
      return this.connect(retries + 1, message);
    });
  }
  disconnect() {
    // Do nothing! :P
    this.connected = false;
    this.emit('disconnect');
  }
  schedulePoll(retries = 0) {
    if (retries >= TIME_CONFIG.POLL_RETRY_LIMIT_CNT) {
      this.disconnect();
      return this.connect();
    }
    // I think 1000ms is too much... Well whatever.
    // TODO is cutting Promise chain really necessary?
    setTimeout(this.poll.bind(this, retries), TIME_CONFIG.POLL_SLEEP_DELAY);
  }
  // Only one poll cycle should be running in a single time
  poll(retries = 0) {
    if (!this.connected) return Promise.reject();
    return this.request({
      url: this.server + POLL_URL,
      qs: {
        'callback_fn': getCallbackFn(),
        sid: this.sid,
        tid: +new Date(),
        crypto: false
      }
    })
    .then(extractResponse)
    .then(message => {
      const { retCode, bdy } = message;
      if (retCode === RESULT_CODE.CMD_SUCCESS ||
        retCode === RESULT_CODE.POLLING_RE_CONN
      ) {
        if (retCode === RESULT_CODE.CMD_SUCCESS) {
          // Something was received
          this.handlePoll(bdy);
        }
        this.schedulePoll();
      } else {
        console.log(message);
        switch (retCode) {
        case RESULT_CODE.ERR_INVALID_SESSION:
        case RESULT_CODE.ERR_SESSION_NOT_FOUND:
        case RESULT_CODE.ERR_SESSION_CONFLICT:
          this.disconnect();
          return this.connect();
        case RESULT_CODE.ERR_EXPIRED_COOKIE:
          this.disconnect();
          // Relogin is required :/
          return this.credentials.login()
            .then(() => this.connect());
          break;
        default:
          // Check limit?
          console.log(message);
          try {
            this.emit('error', message.retMsg);
          } finally {
          }
          return this.schedulePoll(retries + 1);
        }
      }
    })
    .catch(err => {
      console.log(err);
      try {
        this.emit('error', err);
      } finally {
      }
      return this.schedulePoll(retries + 1);
    });
  }
  handlePoll(data) {
    console.log(data);
    // Emit an event...
    this.emit('data', data);
  }
}
