import Message, { MSG_TYPE_INVERT } from './message.js';
import Room from './room.js';
import Cafe from './cafe.js';
import User from './user.js';

const CAFE_LOAD_BARE = 2;
const CAFE_LOAD_PARTIAL = 1;
const CAFE_LOAD_COMPLETE = 0;

const ROOM_LOAD_BARE = 2;
const ROOM_LOAD_PARTIAL = 1;
const ROOM_LOAD_COMPLETE = 0;

// Translates proprietary format to node-ncc-es6 format

export function translateCafeFromMessage(session, data) {
  if (session.cafes[data.cafeId]) return session.cafes[data.cafeId];
  let cafe;
  cafe = session.cafes[data.cafeId] = new Cafe(data.cafeId);
  // There's almost no information to obtain here...
  cafe.loading = CAFE_LOAD_BARE;
  return cafe;
}

export function translateRoomFromMessage(session, data) {
  if (session.rooms[data.roomId]) return session.rooms[data.roomId];
  const cafe = translateCafeFromMessage(session, data);
  let room;
  room = session.rooms[data.roomId] = new Room(data.roomId);
  // There's almost no information to obtain here.
  room.loading = ROOM_LOAD_BARE;
  room.cafe = cafe;
  room.lastMsgSn = data.msgSn - 1,
  room.sync = true;
  cafe.rooms[room.id] = room;
  return room;
}

export function translateUserFromMessage(session, data) {
  const room = translateRoomFromMessage(session, data);
  const cafe = room.cafe;
  let user;
  if (cafe.users[data.senderId] == null) {
    user = cafe.users[data.senderId] = new User(data.senderId);
    room.users[data.senderId] = user;
    user.cafe = cafe;
  } else {
    user = cafe.users[data.senderId];
  }
  user.nickname = data.senderNickname;
  user.image = data.senderProfileUrl.web;
  return user;
}

export function translateMessage(session, data) {
  console.log(data);
  const message = new Message();
  Object.assign(message, {
    id: data.msgSn,
    room: translateRoomFromMessage(session, data),
    type: MSG_TYPE_INVERT[data.msgType.toString()],
    time: new Date(data.msgTimeSec * 1000),
    user: translateUserFromMessage(session, data)
  });
  if (message.type === 'text') {
    message.message = data.msg;
  } else {
    let parsed = JSON.parse(data.msg);
    //console.log(data);
    //console.log(parsed);
    switch (message.type) {
    case 'image':
      Object.assign(message, {
        width: parsed.width,
        height: parsed.height,
        thumb: parsed.webThumbUrl,
        // or orgSSLUrl.
        image: parsed.orgUrl,
        // Not sure if this is required
        message: parsed.orgUrl
      });
      break;
    case 'sticker':
      Object.assign(message, {
        name: parsed.stickerId,
        pack: parsed.packName,
        image: parsed.pc,
        mdpi: parsed.mdpi,
        xhdpi: parsed.xhdpi,
        xxhdpi: parsed.xxhdpi,
        message: parsed.stickerId
      });
    default:
      // TODO should process them..
      message.message = data.msg;
      break;
    }
  }
  return message;
}

export function translateCafe(session, data) {

}

export function translateUser(session, data) {

}
