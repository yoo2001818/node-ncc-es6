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
    user.cafe = cafe;
  } else {
    user = cafe.users[data.senderId];
  }
  room.users[data.senderId] = user;
  if (!data.sent) {
    user.nickname = data.senderNickname;
    user.image = data.senderProfileUrl.web;
  }
  return user;
}

export function translateUserFromTarget(room, data) {
  const cafe = room.cafe;
  // What the heck? Who wrote the server? This doesn't look good...
  // Anyway, we have to check both from the client, which is kinda bad.
  // For your information, 'sender' or 'target' uses id, nickName scheme,
  // 'actionItem' uses memberId, nickname scheme.
  // What a horrible idea. Urrugh.
  const id = data.id || data.memberId;
  const nickname = data.nickName || data.nickname;
  let user;
  if (cafe.users[id] == null) {
    user = cafe.users[id] = new User(id);
    user.cafe = cafe;
  } else {
    user = cafe.users[id];
  }
  room.users[id] = user;
  user.nickname = nickname;
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
    case 'tvCast':
      // Uh, why handle this? This is unimplemented actually.
      // Since this is not going to be used, I'm gonna put random info
      // from the packet. Doesn't matter right? Feel free to send a pull
      // request if you really need this.
      Object.assign(message, {
        message: parsed.title,
        url: parsed.url,
        channel: parsed.channel,
        description: parsed.description,
        title: parsed.title,
        playtime: parsed.playtime,
        thumbnail: parsed.thumbnail
      });
      break;
    // Now, check 'special' messages. We have to handle room name change, etc.
    // But, it's possible to be 'tricked' by false data. Anyone can submit
    // these special messages, and that isn't good. Yup. Maybe some kind of
    // safety methods should exist in here.
    case 'invite':
    case 'leave':
    case 'changeName':
    case 'changeMaster':
    case 'join':
    case 'reject':
    case 'create':
      // Nevertheless, That validation should be done in the server side.
      // But I'm doing a simple check just in case. But this can't block
      // everything, you know.
      const { sender, target, actionItem } = parsed;
      if (message.user.id !== sender.id) {
        // Nope nope nope nope
        console.log('Malformed message received from', message.user);
        console.log('Setting message type to text to prevent bugs');
        console.log(parsed);
        message.message = 'MALFORMED:: ' + data.msg;
        message.type = 'text';
        return message;
      }
      // Otherwise, try to process target.
      message.message = target || actionItem;
      // 'join', 'leave', 'reject', 'invite' can be processed safely;
      // Process data if that's the case.

      // However, 'join' automatically gets processed by previous routine.
      // Which means, we have to do nothing!
      if (message.type === 'join') {
        message.message = message.user.nickname;
        message.target = message.user;
        return message;
      }
      // 'leave' too. However, we need to remove the user from the room.
      // Not from the cafe though, we may need reference to the user later.
      if (message.type === 'leave') {
        // Just remove the user from the room.
        delete message.room.users[message.user.id];
        message.message = message.user.nickname;
        message.target = message.user;
        return message;
      }
      // 'reject'. That equals to leaving. However, we look for the
      // actionItem this time.
      if (message.type === 'reject') {
        // Anyway, retrieve the user from the data.
        const targetUser = translateUserFromTarget(message.room, actionItem);
        // Then remove the user from the room list.
        delete message.room.users[targetUser.id];
        message.message = targetUser.nickname;
        message.target = targetUser;
        return message;
      }
      // 'invite' too. We only have to look for the target!
      // Oh, there are 'groupChatBlockMemberList' and 'secedeMemberList'
      // too but I have no idea what they are. Feel free to send a pull request
      // or issue for that!
      if (message.type === 'invite') {
        // Retrieve the user from the data. This time it's an array.
        const targetUsers = target.map(
          user => translateUserFromTarget(message.room, user)
        );
        // Not too shabby, eh?
        message.message = targetUsers.map(user => user.nickname).join(' ,');
        message.target = targetUsers;
        return message;
      }
      // How about 'changeName'? We can just change room's name. Duh.
      if (message.type === 'changeName') {
        message.room.name = actionItem;
        message.message = actionItem;
        message.target = actionItem;
        return message;
      }
      // We still have 'changeMaster' and 'create'.
      // However, the server doesn't give sufficient information for
      // createMaster, and I have no idea what 'create' does.
      // Force resync if that happens.
      message.message = actionItem;
      // TODO we have to refill information later; But not now.
      message.target = actionItem;

      // message.resync indicates that the message should be trigger resync.
      message.resync = true;
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

export function translateUserBareId(room, id) {
  const cafe = room.cafe;
  let user;
  if (cafe.users[id] == null) {
    user = cafe.users[id] = new User(id);
    user.cafe = cafe;
  } else {
    user = cafe.users[id];
  }
  room.users[id] = user;
  // Nickname is unknown at this moment.
  return user;
}

export function translateUserFromSyncRoom(room, data) {
  const cafe = room.cafe;
  let user;
  if (cafe.users[data.memberId] == null) {
    user = cafe.users[data.memberId] = new User(data.memberId);
    user.cafe = cafe;
  } else {
    user = cafe.users[data.memberId];
  }
  room.users[data.memberId] = user;
  user.nickname = data.nickname;
  user.image = data.memberProfileImageUrl.web;
  // createDate, updateDate, joinState, state, alarm, inviteFlag
  // But probably I don't need them.
  return user;
}

export function translateCafeFromSyncRoom(session, data) {
  const cafe = translateCafeFromMessage(session, data);
  cafe.name = data.cafeName;
  // What the heck?????
  // FYI: SyncRoom returns 'cafeImageurl',
  // but GetRoomList returns 'cafeImageUrl'
  cafe.image = data.cafeImageurl || data.cafeImageUrl;
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

export function translateRoomList(session, data) {
  // It's really fine to 'extend' from message packet
  translateCafeFromSyncRoom(session, data);
  const room = translateRoomFromMessage(session, data);
  room.load = ROOM_LOAD_PARTIAL;
  room.name = data.roomName;
  room.isPublic = data.openType === 'O';
  room.is1to1 = !data.roomType;
  room.userCount = data.memberCnt;
  room.maxUserCount = data.limitMemberCnt;
  room.master = translateUserBareId(room, data.masterUserId);
  room.updated = new Date(data.lastMsgTimeSec * 1000);
  room.lastMsgSn = data.lastMsgSn;
  // TODO Don't process lastMessage yet
  return room;
}
