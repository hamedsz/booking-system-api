import { EventEmitter } from 'events';

/**
 * Since ES6 does not have interface class, we will
 * simulate an interface by extending this class for
 * specific implementation of cache client.
 */
export class Client extends EventEmitter {
  /**
   * Client getter.
   *
   * @returns {Object}
   */
  getClient() {
    throw new Error('Not implemented.');
  }

  /**
   * Determine if the flag _closed is true.
   *
   * @returns {Boolean}
   */
  isClosed() {
    throw new Error('Not implemented.');
  }

  /**
   * Prefix getter.
   *
   * @returns {String}
   */
  getPrefix() {
    throw new Error('Not implemented.');
  }

  /**
   * Prefix getter.
   *
   * @param {String} prefix
   *
   * @returns {CacheClient}
   */
  setPrefix(_prefix) {
    return this;
  }

  /**
   * Get a cached value based from the key provided.
   *
   * @param {String} key
   *
   * @returns {Promise<Object|String>}
   */
  get(_key) {
    throw new Error('Not implemented.');
  }

  /**
   * Put a value in the cache.
   *
   * @param {String} key
   * @param {String} value
   * @param {Integer} ttl
   *
   * @returns {Promise<Boolean>}
   */
  put(_key, _value, _ttl = null) {
    throw new Error('Not implemented.');
  }

  /**
   * Delete a cache.
   *
   * @param {String} key
   *
   * @returns {Promise<Boolean>}
   */
  forget(_key) {
    throw new Error('Not implemented.');
  }

  /**
   * Attempt to get an existing record from cache.
   * If it does not exist, the callback will be executed
   * and the result will be stored in the cache.
   *
   * @param {String} key
   * @param {Integer} ttl
   * @param {Function} callback
   *
   * @returns {Promise<Object>}
   */
  remember(_key, _ttl, _callback) {
    throw new Error('Not implemented.');
  }

  /**
   * Like @remember() except it remembers forever <3
   *
   * @param {String} key
   * @param {Function} callback
   *
   * @returns {Promise<Object>}
   */
  rememberForever(_key, _callback) {
    throw new Error('Not implemented.');
  }

  /**
   * Flush the cache db.
   *
   * @returns {Promise<Boolean>}
   */
  flush() {
    throw new Error('Not implemented.');
  }

  /**
   * Quit the cache db.
   *
   * @returns {Boolean}
   */
  quit() {
    throw new Error('Not implemented.');
  }
}

export default Client;
