import cacheManager from 'cache-manager';
import cacheManagerRedisStore from 'cache-manager-redis-store';
import { Client } from './Client';

export class Redis extends Client {
  /**
   * Create Redis cache client instance.
   *
   * @param {string} prefix
   * @param {CacheConfig} options
   */
  constructor(prefix = '', options = { store: 'none' }) {
    super();
    this.prefix = prefix;
    this.options = options;
    this.client = this.create(options);
  }

  /** @inheritdoc */
  getClient() {
    if (!this.client) {
      this.client = this.create(this.options);
    }

    return this.client;
  }

  /**
   * Create cache client.
   *
   * @private
   * @param {CacheConfig} options
   *
   * @returns
   */
  create(options) {
    const opts = {
      store: cacheManagerRedisStore,
      host: options.host,
      port: options.port,
      db: options.db,
    };

    if (options.password) {
      opts.password = options.password;
    }

    const cache = cacheManager.caching(opts);
    const client = cache.store.getClient();

    client.on('ready', () => {
      this.closed = false;
      this.emit('ready');
    });

    client.on('connect', () => {
      this.emit('connect');
    });

    client.on('error', (error) => {
      const { code } = error;

      if (code === 'ECONNREFUSED' || code === 'NR_CLOSED') {
        client.quit();
        this.closed = true;
      }

      this.emit('error', error);
    });

    return cache;
  }

  /** @inheritdoc */
  isClosed() {
    return Boolean(this.closed);
  }

  /** @inheritdoc */
  getPrefix() {
    return this.prefix;
  }

  /** @inheritdoc */
  setPrefix(prefix = '') {
    this.prefix = prefix;

    return this;
  }

  /** @inheritdoc */
  get(key) {
    return new Promise((resolve, reject) => {
      this.getClient()
        .get(this.getPrefix() + key)
        .then((result) => {
          resolve(result);
        })
        .catch((error) => reject(error));
    });
  }

  /** @inheritdoc */
  getMany(...keys) {
    return new Promise((resolve, reject) => {
      const keysWithPrefix = keys.map((key) => this.getPrefix() + key);

      this.getClient()
        .mget(...keysWithPrefix)
        .then((result) => resolve(result))
        .catch((error) => reject(error));
    });
  }

  /** @inheritdoc */
  put(key, value, ttl = null) {
    return new Promise((resolve, reject) => {
      this.getClient()
        .set(this.getPrefix() + key, value, { ttl })
        .then((result) => {
          if (result === 'OK') {
            return resolve(true);
          }

          return resolve(false);
        })
        .catch((error) => reject(error));
    });
  }

  /** @inheritdoc */
  putMany(sets, ttl = null) {
    return new Promise((resolve, reject) => {
      const values = this.setPrefixForPutMany(sets);

      this.getClient()
        .mset(...values, { ttl })
        .then((result) => {
          const ok = result === 'OK' || 'OK' in result;

          resolve(ok);
        })
        .catch((error) => reject(error));
    });
  }

  /** @inheritdoc */
  forget(...keys) {
    return new Promise((resolve, reject) => {
      this.getClient()
        .del(...keys)
        .then((rows) => resolve(rows > 0))
        .catch((error) => reject(error));
    });
  }

  /** @inheritdoc */
  forgetByPattern(pattern = '*') {
    return new Promise((resolve, reject) => {
      this.getClient()
        .keys(pattern)
        .then((keys) => {
          if (!keys || keys.length === 0) {
            return resolve(true);
          }

          return this.forget(...keys);
        })
        .then((result) => resolve(result))
        .catch((error) => reject(error));
    });
  }

  /** @inheritdoc */
  remember(key, ttl, callback) {
    return new Promise((resolve, reject) => {
      this.getClient()
        .wrap(this.getPrefix() + key, callback, { ttl })
        .then((result) => resolve(result))
        .catch((error) => reject(error));
    });
  }

  /** @inheritdoc */
  rememberForever(key, callback) {
    return this.remember(key, null, callback);
  }

  /** @inheritdoc */
  flush() {
    return new Promise((resolve, reject) => {
      this.getClient()
        .reset()
        .then((result) => {
          if (result === 'OK') {
            return resolve(true);
          }

          return resolve(false);
        })
        .catch((error) => reject(error));
    });
  }

  /** @inheritdoc */
  quit() {
    return new Promise((resolve, reject) => {
      this.getClient()
        .store.getClient()
        .quit((err, response) => {
          if (err) {
            return reject(err);
          }

          return resolve(response === 'OK');
        });
    });
  }

  /**
   * Set prefix for the keys.
   *
   * @protected
   * @param {any[]} [sets=[]]
   *
   * @returns {Array}
   */
  setPrefixForPutMany(sets = []) {
    const newSet = [];

    for (let i = 0; i < sets.length; i += 2) {
      const key = this.getPrefix() + sets[i];
      const value = sets[i + 1];

      newSet.push(...[key, value]);
    }

    return newSet;
  }
}

export default Redis;
