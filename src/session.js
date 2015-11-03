import CommandSession from './commandSession.js';
import { SESSION_SERVER_URLS } from './config.js';
import { translateRoomFromMessage, translateMessage } from './translate.js';

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

export default class Session extends CommandSession {
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
      console.log('unhandled');
      console.log(item);
      break;
    }
  }
  handleMessage(message) {
    // Create chatroom / cafe if it doesn't exist.
    if (this.rooms[message.roomId] == null) {
      // TODO There's more data in it, but I'll leave like this now.
      this.rooms[message.roomId] = translateRoomFromMessage(this, message);
    }
    const room = this.rooms[message.roomId];
    // Handle 'sent by itself' messages specially
    // Server doesn't have this data, so we'll lost this data if we sync it
    // again.
    if (message.sent) {
      room.lastSentMsgSn = message.msgSn;
    }
    // Check if message is in sync. If we have missing messages,
    // Drop current message and request new one.
    if (message.msgSn - room.lastMsgSn > 1) {
      return this.syncMsg(room);
    }
    room.lastMsgSn = message.msgSn;
    const newMessage = translateMessage(this, message);
    // Handle 'sent by itself' message.
    if (newMessage.id === room.lastSentMsgSn) {
      newMessage.sent = true;
    }
    room.lastMessage = newMessage;
    this.emit('message', newMessage);
    console.log(newMessage);
  }
}
