import invert from 'lodash.invert';
// TODO Why is it here..?

export const MSG_TYPE = {
  text: 0,
  invite: 101,
  leave: 102,
  changeName: 103,
  changeMaster: 104,
  join: 105,
  // aka ban
  reject: 106,
  create: 107,
  sticker: 201,
  image: 301,
  tvCast: 401
  // TODO tvcast support?
};

export const MSG_TYPE_INVERT = invert(MSG_TYPE);

export default class Message {
  constructor() {
    // Nothing to do in here
    this.id;
    this.room;
    this.type;
    this.time;
    this.user;
    this.message;
    this.data;
  }
}
