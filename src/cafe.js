import values from 'lodash.values';

export default class Cafe {
  constructor(id, name) {
    this.id = id;
    this.name = name;
    this.image = null;
    this.users = {};
    this.rooms = {};
    this.loading = null;
  }
  toJSON() {
    return Object.assign({}, this, {
      rooms: values(this.rooms),
      users: values(this.users)
    });
  }
  inspect() {
    return this.name || this.id;
  }
}
