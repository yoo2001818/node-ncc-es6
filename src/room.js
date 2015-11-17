import values from 'lodash.values';
import { ROOM_LOAD_BARE } from './translate.js';

export default class Room {
  constructor(session, id, name) {
    this.session = session;
    this.id = id;
    this.name = name;
    this.isPublic = null;
    this.is1to1 = null;
    this.cafe = null;
    this.maxUserCount = null;
    this.userCount = null;
    this.users = {};
    this.joined = true;
    this.master = null;
    this.updated = null;
    this.lastMessage = null;
    this.loading = false;
    this.load = ROOM_LOAD_BARE;
  }
  toJSON() {
    let users = values(this.users);
    users = users.map(user => user.id);
    return Object.assign({}, this, {
      cafe: this.cafe && this.cafe.id,
      users,
      session: undefined
    });
  }
  inspect() {
    return (this.name || this.id) + (this.joined ? '' : ' (Unjoined)');
  }
}
