export default class User {
  constructor(id, nickname) {
    this.id = id;
    this.nickname = nickname;
    this.image = null;
    this.cafe = null;
  }
  toJSON() {
    return Object.assign({}, this, {
      cafe: this.cafe && this.cafe.id
    });
  }
  inspect() {
    return `${this.nickname} (${this.id})`;
  }
}
