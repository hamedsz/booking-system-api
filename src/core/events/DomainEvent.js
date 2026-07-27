export default class DomainEvent {
  constructor(name, payload) {
    this.name = name;
    this.payload = payload;
  }
}
