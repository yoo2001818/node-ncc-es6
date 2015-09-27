import RawSession, { DEVICE_TYPE } from './rawSession.js';
import { SESSION_SERVER_URLS, CHAT_BROKER_SSL_URL,
  COMMAND_TYPE, COMMAND_RESULT_CODE } from './config.js';
import { translateSyncRoom } from './translate.js';

const VERSION = 1;
const COMMAND_URL = '/api/Command.nhn';

const validateResponse = (body) => {
  if (body.retCode === COMMAND_RESULT_CODE.SUCCESS) {
    return body;
  }
  // Otherwise an error.
  const error = new Error(`${body.retTitle}, ${body.retMsg}`);
  error.retCode = body.retCode;
  throw error;
};

export default class CommandSession extends RawSession {
  constructor(server, credentials) {
    super(server, credentials);
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
        uid: this.username,
        tid: +new Date(),
        sid: this.sid,
        deviceType: DEVICE_TYPE.WEB,
        cmd: COMMAND_TYPE[command],
        bdy: body
      }
    });
  }
  // This deletes room from the USER. which means, this doesn't terminate
  // the room.
  deleteRoom(room) {
    return this.sendCommand('DeleteRoom', {
      cafeId: room.cafe.id,
      roomId: room.id
    })
    .then(validateResponse)
    .then(() => {
      // Remove room from the list, I suppose
      delete room.users[this.username];
    }, body => {
      switch (body.retCode) {
      case COMMAND_TYPE.NOT_FOUND_ROOM:
        throw new Error(`DeleteRoom: Cannot find room ${room.id}`);
        // Remove room anyway
      case COMMAND_TYPE.NOT_ROOM_MEMBER:
        throw new Error(`DeleteRoom: Not a member of room ${room.id}`);
        // Still, remove room anyway
      default:
        throw body;
      }
    });
  }
  // This closes the room forcefully. Only staffs are able to do it.
  closeOpenroom(room) {
    return this.sendCommand('CloseOpenroom', {
      cafeId: room.cafe.id,
      roomId: room.id
    })
    .then(validateResponse)
    .then(() => {
      // The room has been terminated; Delete from cafe and room.
      delete this.rooms[room.id];
      delete room.cafe.rooms[room.id];
    }, body => {
      // TODO What's the error code of this?
      throw body;
    });
  }
  // Fetches data from the server and elevates loading level to 0
  syncRoom(room) {
    room.loading = true;
    return this.sendCommand('SyncRoom', {
      cafeId: room.cafe.id,
      roomId: room.id,
      // TODO What does this mean?
      updateTimeSec: 0,
      // TODO It's 1 or 20
      size: 1
    })
    .then(validateResponse)
    .then(command => {
      const body = command.bdy;
      translateSyncRoom(this, body);
      // Oh well doesn't matter. elevate loading level to 0
      room.load = 0;
      room.loading = false;
    }, body => {
      room.loading = false;
      // TODO What's the error code of this?
      throw body;
    });
  }
}
