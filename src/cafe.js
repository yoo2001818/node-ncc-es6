import values from 'lodash.values';
import { CAFE_LOAD_BARE } from './translate.js';

export default class Cafe {
  constructor(session, id, name) {
    this.session = session;
    this.id = id;
    this.name = name;
    this.image = null;
    this.users = {};
    this.rooms = {};
    this.loading = false;
    this.load = CAFE_LOAD_BARE;
  }
  toJSON() {
    return Object.assign({}, this, {
      rooms: values(this.rooms),
      users: values(this.users),
      session: undefined
    });
  }
  inspect() {
    return this.name || this.id;
  }
}
