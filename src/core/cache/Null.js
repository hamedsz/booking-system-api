import { Client } from './Client';

export class Null extends Client {
  /** @override */
  constructor() {
    super();
    this.emit('connect');
  }

  /** @inheritdoc */
  getClient() {
    return null;
  }

  /** @inheritdoc */
  isClosed() {
    return false;
  }

  /** @inheritdoc */
  getPrefix() {
    return '';
  }

  /** @inheritdoc */
  setPrefix(_prefix) {
    return this;
  }

  /** @inheritdoc */
  get(_key) {
    return Promise.resolve(null);
  }

  /** @inheritdoc */
  put(_key, _value, _ttl = null) {
    return Promise.resolve(false);
  }

  /** @inheritdoc */
  getMany(..._keys) {
    return Promise.resolve(null);
  }

  /** @inheritdoc */
  putMany(_sets, _ttl = null) {
    return Promise.resolve(false);
  }

  /** @inheritdoc */
  forget(..._keys) {
    return Promise.resolve(true);
  }

  /** @inheritdoc */
  forgetByPattern(_pattern) {
    return Promise.resolve(true);
  }

  /** @inheritdoc */
  remember(key, ttl, callback) {
    return Promise.resolve(callback());
  }

  /** @inheritdoc */
  rememberForever(key, callback) {
    return this.remember(key, null, callback);
  }

  /** @inheritdoc */
  flush() {
    return Promise.resolve(true);
  }

  /** @inheritdoc */
  quit() {
    return Promise.resolve(true);
  }
}

export default Null;
