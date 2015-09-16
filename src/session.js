import RawSession, { DEVICE_TYPE } from './rawSession.js';
import { SESSION_SERVER_URLS, CHAT_BROKER_SSL_URL,
  COMMAND_TYPE, COMMAND_RESULT_CODE } from './config.js';

const VERSION = 1;
const COMMAND_URL = '/api/Command.nhn';

const NOTI_TYPE = {
  Msg: 93001,
  Invited: 93002,
  ChangeRoomName: 93003,
  DeleteRoom: 93004,
  DelegateMaster: 93005,
  JoinRoom: 93006,
  RejectMember: 93007,
  ClosedOpenroom: 93008
};

const MSG_TYPE = {
  Normal: 0,
  Invite: 101,
  Leave: 102,
  ChangeRoomName: 103,
  ChangeMasterId: 104,
  JoinRoom: 105,
  RejectMember: 106,
  OpenRoomCreateGreeting: 107,
  Sticker: 201,
  Image: 301
};

const validateResponse = (body) => {
  if (body.retCode === COMMAND_RESULT_CODE.SUCCESS) {
    return body;
  }
  // Otherwise an error.
  throw body;
};

export default class Session extends RawSession {
  constructor(credentials) {
    // Randomly choose a server
    const server = SESSION_SERVER_URLS[Math.floor(Math.random()*10)+11];
    super(server, credentials);
    this.rooms = {};
    this.cafes = {};
  }
  handlePoll(data) {
    data.forEach(item => {
      this.handleNotification(item);
    });
  }
  handleNotification(item) {
    switch (item.cmd) {
    case NOTI_TYPE.Msg:
      // Handle message
      this.handleMessage(item.bdy);
      break;
    case NOTI_TYPE.ClosedOpenroom:
      // Room has been destroyed.
      break;
    case NOTI_TYPE.Invited:
    case NOTI_TYPE.ChangeRoomName:
    case NOTI_TYPE.DeleteRoom:
    case NOTI_TYPE.DelegateMaster:
    case NOTI_TYPE.JoinRoom:
    case NOTI_TYPE.RejectMember:
      break;
    }
  }
  handleMessage(message) {
    // Create chatroom / cafe if it doesn't exist.
    if (this.rooms[message.roomId] == null) {
      // TODO There's more data in it, but I'll leave like this now.
      this.rooms[message.roomId] = {
        lastMsgSn: message.msgSn - 1,
        sync: true
      };
    }
    const room = this.rooms[message.roomId];
    // Check if message is in sync. If we have missing messages,
    // Drop current message and request new one.
    if (message.msgSn - room.lastMsgSn > 1) {
      if (room.sync) {
        room.sync = false;
        // TODO move this somewhere else?
        this.sendCommand('SyncMsg', {
          cafeId: message.cafeId,
          roomId: message.roomId,
          lastMsgSn: room.lastMsgSn,
          size: 100
        })
        .then(validateResponse)
        .then(res => {
          const body = res.bdy;
          // Digest missed messages
          room.lastMsgSn = body.lastMsgSn;
          room.sync = true;
          body.msgList.forEach(message => {
            this.handleMessage(message);
          });
        });
      }
      return;
    }
    room.lastMsgSn = message.msgSn;
    console.log(message);
  }
  sendCommand(command, body) {
    if (!this.connected) return Promise.reject(new Error('Not connected'));
    return this.request({
      url: CHAT_BROKER_SSL_URL + COMMAND_URL,
      method: 'POST',
      timeout: 10000,
      json: true,
      body: {
        ver: VERSION,
        uid: this.credentials.username,
        tid: +new Date(),
        sid: this.sid,
        deviceType: DEVICE_TYPE.WEB,
        cmd: COMMAND_TYPE[command],
        bdy: body
      }
    });
  }
}
