import values from 'lodash.values';

export default class Room {
  constructor(id, name) {
    this.id = id;
    this.name = name;
    this.isPublic = null;
    this.is1to1 = null;
    this.cafe = null;
    this.maxUserCount = null;
    this.userCount = null;
    this.users = {};
    this.master = null;
    this.updated = null;
    this.created = null;
    this.lastMessage = null;
    this.loading = null;
  }
  toJSON() {
    let users = values(this.users);
    users = users.map(user => user.id);
    return Object.assign({}, this, {
      cafe: this.cafe && this.cafe.id,
      users
    });
  }
  inspect() {
    return this.id || this.name;
  }
}
