import CommandSession from './commandSession.js';
import { SESSION_SERVER_URLS } from './config.js';
import { translateRoomFromMessage, translateMessage } from './translate.js';
import uploadImage from './uploadImage.js';
import debug from 'debug';

const log = debug('ncc:session');

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

class Session extends CommandSession {
  constructor(credentials) {
    // Randomly choose a server
    const server = SESSION_SERVER_URLS[Math.floor(Math.random()*10)+11];
    super(server, credentials);
  }
  handlePoll(data) {
    data.forEach(item => {
      this.handleNotification(item);
    });
  }
  handleNotification(item) {
    log('Handling notifcation %s', item.cmd);
    switch (item.cmd) {
    case NOTI_TYPE.Msg:
      // Handle message
      this.handleMessage(item.bdy);
      break;
    case NOTI_TYPE.ClosedOpenroom:
      // Room has closed; Remove reference to it
      delete this.rooms[item.bdy.roomId];
      break;
    case NOTI_TYPE.Invited:
    case NOTI_TYPE.ChangeRoomName:
    case NOTI_TYPE.DeleteRoom:
    case NOTI_TYPE.DelegateMaster:
    case NOTI_TYPE.JoinRoom:
    case NOTI_TYPE.RejectMember:
    default:
      // Create chatroom / cafe if it doesn't exist.
      if (this.rooms[item.bdy.roomId] == null) {
        // TODO There's more data in it, but I'll leave like this now.
        this.rooms[item.bdy.roomId] = translateRoomFromMessage(this, item.bdy);
        log('Creating missing room');
      }
      const room = this.rooms[item.bdy.roomId];
      // Just resync it; Heh.
      this.syncMsg(room);
      break;
    }
  }
  handleMessage(message) {
    // Create chatroom / cafe if it doesn't exist.
    if (this.rooms[message.roomId] == null) {
      // TODO There's more data in it, but I'll leave like this now.
      this.rooms[message.roomId] = translateRoomFromMessage(this, message);
      log('Creating missing room');
    }
    const room = this.rooms[message.roomId];
    // Ignore if room is not in sync.
    if (!room.sync) return;
    // Handle 'sent by itself' messages specially
    // Server doesn't have this data, so we'll lost this data if we sync it
    // again.
    if (message.sent) {
      log('Processing sent message');
      room.lastSentMsgSn = message.msgSn;
    }
    // Check if message is in sync. If we have missing messages,
    // Drop current message and request new one.
    if (message.msgSn - room.lastMsgSn > 1) {
      log('Sync failed; requesting resync');
      return this.syncMsg(room);
    }
    room.lastMsgSn = message.msgSn;
    const newMessage = translateMessage(this, message);
    // Handle 'sent by itself' message.
    if (newMessage.id === room.lastSentMsgSn) {
      log('Handling sent message');
      newMessage.sent = true;
    }
    // Handle force resync messages.
    if (newMessage.resync) {
      // However, we don't need wait for result to come. I think so?
      this.syncRoom(newMessage.room);
    }
    room.lastMessage = newMessage;
    this.emit('message', newMessage);
    return newMessage;
  }
  // Helper functions to send messages
  sendText(room, text) {
    return this.sendMsg({
      room: room,
      type: 'text',
      message: text + ''
    });
  }
  sendSticker(room, stickerId) {
    return this.sendMsg({
      room: room,
      type: 'sticker',
      message: stickerId
    });
  }
  // Image can be either stream, or uploaded image object
  sendImage(room, image, options) {
    if (image.path == null || image.fileSize == null) {
      // Do upload first
      return uploadImage(this.request, image, options)
      // Then recall this routine
      .then(this.sendImage.bind(this, room));
    }
    return this.sendMsg({
      room: room,
      type: 'image',
      message: image
    });
  }
}

export default Session;
