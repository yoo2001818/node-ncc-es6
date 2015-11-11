import Message, { MSG_TYPE_INVERT } from './message.js';
import Room from './room.js';
import Cafe from './cafe.js';
import User from './user.js';

export const CAFE_LOAD_BARE = 2;
export const CAFE_LOAD_PARTIAL = 1;
export const CAFE_LOAD_COMPLETE = 0;

export const ROOM_LOAD_BARE = 2;
export const ROOM_LOAD_PARTIAL = 1;
export const ROOM_LOAD_COMPLETE = 0;

// Translates proprietary format to node-ncc-es6 format

export function translateCafeFromMessage(session, data) {
  if (session.cafes[data.cafeId]) return session.cafes[data.cafeId];
  let cafe;
  cafe = session.cafes[data.cafeId] = new Cafe(session, data.cafeId);
  // There's almost no information to obtain here...
  cafe.load = CAFE_LOAD_BARE;
  return cafe;
}

export function translateRoomFromMessage(session, data) {
  if (session.rooms[data.roomId]) return session.rooms[data.roomId];
  const cafe = translateCafeFromMessage(session, data);
  let room;
  room = session.rooms[data.roomId] = new Room(session, data.roomId);
  // There's almost no information to obtain here.
  room.load = ROOM_LOAD_BARE;
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
  if (!data.sent) {
    user.nickname = data.senderNickname;
    user.image = data.senderProfileUrl.web;
  }
  return user;
}

export function translateMessage(session, data) {
  const message = new Message();
  Object.assign(message, {
    id: data.msgSn,
    room: translateRoomFromMessage(session, data),
    type: MSG_TYPE_INVERT[data.msgType.toString()],
    time: new Date(data.msgTimeSec * 1000),
    user: translateUserFromMessage(session, data),
    sent: data.sent || false
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
        mdpi: parsed.non_retina,
        xhdpi: parsed.xhdpi,
        xxhdpi: parsed.xxhdpi,
        message: parsed.stickerId
      });
      break;
    default:
      console.log(parsed);
      // TODO should process them..
      message.message = data.msg;
      break;
    }
  }
  return message;
}

export function translateUserFromSyncRoom(room, data) {
  const cafe = room.cafe;
  let user;
  if (cafe.users[data.memberId] == null) {
    user = cafe.users[data.memberId] = new User(data.memberId);
    room.users[data.memberId] = user;
    user.cafe = cafe;
  } else {
    user = cafe.users[data.memberId];
  }
  user.nickname = data.nickname;
  user.image = data.memberProfileImageUrl.web;
  // createDate, updateDate, joinState, state, alarm, inviteFlag
  // But probably I don't need them.
  return user;
}

export function translateCafeFromSyncRoom(session, data) {
  const cafe = translateCafeFromMessage(session, data);
  cafe.name = data.cafeName;
  cafe.image = data.cafeImageurl;
}

export function translateSyncRoom(session, data) {
  // It's really fine to 'extend' from message packet
  translateCafeFromSyncRoom(session, data);
  const room = translateRoomFromMessage(session, data);
  room.load = ROOM_LOAD_COMPLETE;
  room.name = data.roomName;
  room.isPublic = data.openType === 'O';
  room.is1to1 = !data.roomType;
  room.userCount = data.membercnt;
  room.maxUserCount = data.limitMemberCnt;
  // Parse room user list.
  room.users = {};
  data.memberList.forEach(user => translateUserFromSyncRoom(room, user));
  room.master = room.users[data.masterUserId];
  room.updated = new Date(data.updateTimeSec * 1000);
  const message = data.msgList.pop();
  message.roomId = data.roomId;
  message.cafeId = data.cafeId;
  room.lastMessage = translateMessage(session, message);
  // Things I didn't handle in here
  // closePermission
  // lastAckSn
  // offsetmsgSn
  // msgList
  // alarm
  return room;
}
