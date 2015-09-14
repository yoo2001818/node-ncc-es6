// Server address
export const CHAT_HOME_URL = 'https://chat.cafe.naver.com/ChatHome.nhn';
export const SESSION_SERVER_URLS = ['https://ss.cafe.naver.com'];
// This may look better if I've used lodash. :/
// Still better than old version of node-ncc.
for (let i = 1; i <= 20; ++i) {
  SESSION_SERVER_URLS[i] = `https://ss${i}.cafe.naver.com`;
}

// Server API endpoint
export const COMMAND_URL = '/api/Command.nhn';
export const POLL_URL = '/poll.nhn';
export const CONNECT_URL = '/conn.nhn';
// There's 'close' too, but I don't think I'll need it.
// If anyone needs it, feel free to open an issue

// Time related config
export const TIME = {
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
