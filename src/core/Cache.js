import crypto from 'crypto';
import { EventEmitter } from 'events';
import { Redis } from './cache/Redis';
import { Null } from './cache/Null';
import { cache as config } from '../config/cache';

export const TTL = {
  ONE_HOUR: 60 * 60,
  TWO_DAYS: 60 * 60 * 24 * 2,
};

export class Cache extends EventEmitter {
  /**
   * Create a cache instance.
   */
  constructor() {
    super();
    this.drivers = {
      null: Null,
      redis: Redis,
    };

    this.createdClients = {};
    this.create();
  }

  /**
   * Create an instance of a cache store.
   *
   * @private
   *
   * @returns {Client}
   */
  create() {
    const driver = config.driver || 'null';

    this.client = this.getInstance(driver);

    return this.client;
  }

  /**
   * Attempt to get a cache of a created client,
   * otherwise instantiate a new one.
   *
   * @private
   * @param {string} driver
   *
   * @returns {Client}
   */
  getInstance(driver) {
    let instance = this.createdClients[driver];

    if (!instance) {
      const { prefix, clients } = config;
      const Client = this.drivers[driver];

      instance = new Client(prefix, clients[driver]);
      instance.on('error', (err) => this.emit('error', err));
      instance.on('connect', () => this.emit('connect'));

      this.createdClients[driver] = instance;
    }

    return instance;
  }

  /**
   * Client getter. This method will return
   * the current client instance if it's not closed.
   * Else, it will default to the Null client.
   *
   * Deleting the closed client will attempt to create a new
   * one with open connection, e.g. Redis.
   *
   * @returns {Client}
   */
  getClient() {
    const { driver } = config;

    if (!this.client) {
      this.client = this.getInstance(driver);
    }

    if (this.client.isClosed()) {
      this.client = null;
      delete this.createdClients[driver];

      return this.getInstance('null');
    }

    return this.client;
  }

  /**
   * Set the current cache client.
   *
   * @param {Client|null} client
   *
   * @returns {Cache}
   */
  setClient(client) {
    this.client = client;

    return this;
  }

  /**
   * Generate a cache key from a given source.
   *
   * @param {*} [source='']
   *
   * @returns {String}
   */
  generateKey(source = '') {
    return crypto.createHash('md5').update(JSON.stringify(source)).digest('hex');
  }

  /**
   * Prefix getter.
   *
   * @returns {String}
   */
  getPrefix() {
    return this.getClient().getPrefix();
  }

  /**
   * Prefix getter.
   *
   * @param {String} prefix
   *
   * @returns {Client}
   */
  setPrefix(prefix) {
    return this.getClient().setPrefix(prefix);
  }

  /**
   * Get a cached value based from the key provided.
   *
   * @param {String} key
   *
   * @returns {Promise<any>}
   */
  get(key) {
    return this.getClient().get(key);
  }

  /**
   * Put a value in the cache.
   *
   * @param {String} key
   * @param {any} value
   * @param {Number|Null} ttl
   *
   * @returns {Promise<Boolean>}
   */
  put(key, value, ttl = null) {
    return this.getClient().put(key, value, ttl);
  }

  /**
   * Get multiple cache records.
   *
   * @param {...String[]} keys
   *
   * @returns {Promise<any[]>}
   */
  getMany(...keys) {
    return this.getClient().getMany(...keys);
  }

  /**
   * Multiple cache put.
   *
   * @param {any[]} sets
   * @param {(Number | Null)} [ttl=null]
   *
   * @returns {Promise<Boolean>}
   */
  putMany(sets, ttl = null) {
    return this.getClient().putMany(sets, ttl);
  }

  /**
   * Delete a cache.
   *
   * @param {...String[]} keys
   *
   * @returns {Promise<Boolean>}
   */
  forget(...keys) {
    return this.getClient().forget(...keys);
  }

  /**
   * Delete cache values by pattern.
   *
   * @param {string} [pattern='*']
   *
   * @returns {Promise<Boolean>}
   */
  forgetByPattern(pattern) {
    return this.getClient().forgetByPattern(pattern);
  }

  /**
   * Attempt to get an existing record from cache.
   * If it does not exist, the callback will be executed
   * and the result will be stored in the cache.
   *
   * @param {String} key
   * @param {Number} ttl
   * @param {Function} callback
   *
   * @returns {Promise<any>}
   */
  remember(key, ttl, callback) {
    return new Promise((resolve, reject) => {
      this.getClient()
        .remember(key, ttl, callback)
        .then((result) => resolve(result))
        .catch((error) => {
          if (!this.client || this.client.isClosed()) {
            return resolve(callback());
          }

          return reject(error);
        });
    });
  }

  /**
   * Like @remember() except it remembers forever <3
   *
   * @param {String} key
   * @param {Function} callback
   *
   * @returns {Promise<any>}
   */
  rememberForever(key, callback) {
    return this.getClient().rememberForever(key, callback);
  }

  /**
   * Flush the cache db.
   *
   * @returns {Promise<Boolean>}
   */
  flush() {
    return this.getClient().flush();
  }

  /**
   * Quit the cache client.
   *
   * @returns {Promise<Boolean>}
   */
  quit() {
    return this.getClient().flush();
  }
}

export default new Cache();
