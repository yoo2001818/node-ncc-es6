import RawSession, { DEVICE_TYPE } from './rawSession.js';
import { CHAT_BROKER_SSL_URL,
  COMMAND_TYPE, COMMAND_RESULT_CODE } from './config.js';
import { MSG_TYPE } from './message.js';
import { translateSyncRoom, translateRoomList } from './translate.js';
import debug from 'debug';

const log = debug('ncc:commandSession');

const VERSION = 1;
const COMMAND_URL = '/api/Command.nhn';

const CHAT_IMGS_URL = 'http://cafechat.phinf.naver.net';

const validateResponse = (body) => {
  if (body.retCode === COMMAND_RESULT_CODE.SUCCESS) {
    return body;
  }
  // Otherwise an error.
  const error = new Error(`${body.retTitle}, ${body.retMsg}`);
  error.retCode = body.retCode;
  throw error;
};

class CommandSession extends RawSession {
  constructor(server, credentials) {
    super(server, credentials);
    this.rooms = {};
    this.cafes = {};
    this.roomsLoaded = false;
  }
  sendCommand(command, body) {
    if (!this.connected) return Promise.reject(new Error('Not connected'));
    log('Sending command %s', command);
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
    // Check validity of the room data.
    if (this.roomsLoaded && this.rooms[room.id] == null) {
      return Promise.reject(new Error('Not joined in the room'));
    }
    return this.sendCommand('DeleteRoom', {
      cafeId: room.cafe.id,
      roomId: room.id
    })
    .then(validateResponse)
    .then(() => {
      log('Successfully deleted room %s', room.name);
      // Remove room from the list, I suppose
      delete room.users[this.username];
      room.userCount --;
      delete this.rooms[room.id];
      // But don't delete it from the cafe; Room doesn't get removed even if
      // the user leave the room... unless there is only one user in the room.
      if (room.userCount === 0) delete room.cafe.rooms[room.id];
      return room;
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
    // Check validity of the room data.
    if (this.roomsLoaded && room.cafe.rooms[room.id] == null) {
      return Promise.reject(new Error('Room does not exist'));
    }
    return this.sendCommand('CloseOpenroom', {
      cafeId: room.cafe.id,
      roomId: room.id
    })
    .then(validateResponse)
    .then(() => {
      log('Successfully closed room %s', room.name);
      // The room has been terminated; Delete from cafe and room.
      delete this.rooms[room.id];
      delete room.cafe.rooms[room.id];
      return room;
    }, body => {
      // TODO What's the error code of this?
      throw body;
    });
  }
  // Fetches data from the server and elevates loading level to 0
  // This also joins to the room if the user hasn't joined yet. Quite
  // weird, right?
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
      const newRoom = translateSyncRoom(this, body);
      log('Synced room %s', newRoom.name);
      // Oh well doesn't matter. elevate loading level to 0
      newRoom.load = 0;
      newRoom.loading = false;
      return newRoom;
    }, body => {
      room.loading = false;
      // TODO What's the error code of this?
      throw body;
    });
  }
  // Just an alias..
  joinRoom(cafeId, roomId) {
    if (cafeId.id) return this.syncRoom(cafeId);
    return this.syncRoom({
      id: roomId,
      cafe: {
        id: cafeId
      }
    });
  }
  // Fetches connected chat room list
  getRoomList() {
    return this.sendCommand('GetRoomList', {
      // Just directly using room list protocol from original code
      cafeId: 0,
      lastMsgTimeSec: 0,
      // Type does nothing - :P
      type: 1,
      size: 100
    })
    .then(validateResponse)
    .then(res => {
      this.roomsLoaded = true;
      const { roomList } = res.bdy;
      // We only need to look for roomList.
      const rooms = roomList.map(room => translateRoomList(this, room));
      return rooms;
    }, body => {
      throw body;
    });
  }
  // Changes room name
  changeRoomName(room, name) {
    if (room.master && room.master.id !== this.username) {
      return Promise.reject(new Error('You are not master of the room'));
    }
    return this.sendCommand('ChangeRoomName', {
      cafeId: room.cafe.id,
      roomId: room.id,
      roomName: name
    })
    .then(validateResponse)
    .then(() => {
      // Since we don't know message state at this time, request message
      // sync.
      return this.syncMsg(room);
    });
  }
  // Hands room master; Can accept user ID or user object.
  delegateMaster(room, user) {
    if (room.master && room.master.id !== this.username) {
      return Promise.reject(new Error('You are not master of the room'));
    }
    if (user.id) user = user.id;
    return this.sendCommand('DelegateMaster', {
      cafeId: room.cafe.id,
      roomId: room.id,
      targetMemberId: user
    })
    .then(validateResponse)
    .then(() => {
      // Resync is required for this too.
      return this.syncMsg(room);
    });
  }
  // 'Bans' the user. Can accept user ID or user object.
  rejectMember(room, user) {
    if (room.master && room.master.id !== this.username) {
      return Promise.reject(new Error('You are not master of the room'));
    }
    if (user.id) user = user.id;
    return this.sendCommand('RejectMember', {
      cafeId: room.cafe.id,
      roomId: room.id,
      targetMemberId: user
    })
    .then(validateResponse)
    .then(() => {
      // Resync is required for this too.
      return this.syncMsg(room);
    });
  }
  // Syncs lost message from the server
  syncMsg(room) {
    if (room.sync) {
      room.sync = false;
      // TODO move this somewhere else?
      return this.sendCommand('SyncMsg', {
        cafeId: room.cafe.id,
        roomId: room.id,
        lastMsgSn: room.lastMsgSn,
        size: 100
      })
      .then(validateResponse)
      .then(res => {
        log('Synced messages; digesting');
        const body = res.bdy;
        // Digest missed messages
        room.lastMsgSn = body.lastMsgSn;
        room.sync = true;
        const list = body.msgList.map(newMessage => {
          // Fill unsent information
          newMessage.cafeId = room.cafe.id;
          newMessage.roomId = room.id;
          // There's no way to obtain this information if unsync has occurred
          newMessage.msgId = null;
          return this.handleMessage(newMessage);
        });
        log('Digestion done');
        return list;
      })
      .catch(err => {
        console.log(err);
      });
    }
    return Promise.resolve();
  }
  // Sends a message to the server
  sendMsg(message) {
    const rawMsg = {
      cafeId: message.room.cafe.id,
      roomId: message.room.id,
      msgType: MSG_TYPE[message.type],
      // This doesn't mean anything! What's this for?
      msgId: new Date().valueOf(),
      msg: message.message
    };
    return this.sendCommand('SendMsg', rawMsg)
    .then(validateResponse)
    .then(command => {
      const body = command.bdy;
      // Combine rawMsg with body
      Object.assign(rawMsg, body, {
        // 'sent' flag shows that this is sent by itself so
        // bots and other things shouldn't process it
        sent: true,
        // Also, inject username simply because it's not sent from the server
        senderId: this.username
      });
      // TODO restore information if possible
      if (message.type === 'sticker') {
        rawMsg.msg = JSON.stringify({
          stickerId: rawMsg.msg
        });
      } else if (message.type === 'image') {
        rawMsg.msg = JSON.stringify(Object.assign({}, message.message, {
          orgUrl: CHAT_IMGS_URL + message.message.path
        }));
      }
      log('Sent message; handling');
      // Then, handle it
      return this.handleMessage(rawMsg);
    }, body => {
      // TODO What's the error code of this?
      throw body;
    });
  }
  // Send an acknowledge to the server. However, this is only necessary if
  // you're making an actual chat client, it's not required for bots.
  // However, node-ncc-es6 doesn't handle lastAckSn yet, so this isn't likely
  // to be used anyway. TODO feel free to send a pull request.
  ackMsg(message) {
    return this.sendCommand('AckMsg', {
      cafeId: message.room.cafe.id,
      roomId: message.room.id,
      lastMsgSn: message.id
    })
    // However, validation isn't required.
    .then(validateResponse);
  }
  // While commandSession itself doesn't use polling, but we still need to
  // process message. Of course it's very raw and not ready to use.
  // Session will extend it to make it better.
  handleMessage(message) {
    // Emit an event...
    this.emit('rawMessage', message);
  }
}

export default CommandSession;
