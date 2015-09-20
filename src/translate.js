import Message, { MSG_TYPE_INVERT } from './message.js';

// Translates proprietary format to node-ncc-es6 format

export function translateMessage(session, data) {
  const message = new Message();
  Object.assign(message, {
    id: data.msgSn,
    // TODO obtain room
    room: null,
    type: MSG_TYPE_INVERT[data.msgType.toString()],
    time: new Date(data.msgTimeSec * 1000),
    // TODO obtain user
    user: null
  });
  if (message.type === 'text') {
    message.message = data.msg;
  } else {
    let parsed = JSON.parse(data.msg);
    console.log(data);
    console.log(parsed);
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
      break;
    }
  }
  return message;
}

export function translateCafe(session, data) {

}

export function translateUser(session, data) {

}
