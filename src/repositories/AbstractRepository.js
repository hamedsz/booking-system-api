import { Op, Sequelize, DataTypes } from 'sequelize';

export class AbstractRepository {
  /**
   * Create repository instance.
   */
  constructor() {
    this.filters = {};
    this.sorts = [];
    this.page = {};
  }

  /**
   * Set pagination.
   *
   * @param {number} [page=1]
   * @param {number} [limit=15]
   *
   * @returns {AbstractRepository}
   */
  setPage(page = 1, limit = 15) {
    this.page = { current: page, limit };

    return this;
  }

  /**
   * Get pagination options for query if available.
   *
   * @returns {Object|Null}
   */
  getPageOpts() {
    if (!this.page.current) {
      return null;
    }

    const { current, limit } = this.page;
    const offset = 0 + (current - 1) * limit;

    return { offset, limit };
  }

  /**
   * Set filters to be used for getters.
   *
   * @param {Object} [filters={}]
   *
   * @returns {AbstractRepository}
   */
  setFilters(filters = {}) {
    if (typeof filters === 'object') {
      this.filters = filters;
    }

    return this;
  }

  /**
   * Add orderBy query to getters.
   *
   * @param {String} field
   * @param {String} [direction='ASC']
   *
   * @returns {AbstractRepository}
   */
  sortBy(field, direction = 'ASC') {
    this.sorts.push([field, direction === 'ASC' ? 'ASC' : 'DESC NULLS LAST']);

    return this;
  }

  /**
   * Starts a managed Sequelize transaction.
   * Passing a callback automatically commits when resolved, or rolls back if an error is thrown.
   */
  async createTransaction(callback) {
    return this.model.sequelize.transaction(async (trx) => callback(trx));
  }

  /**
   * Set orderBy query for getters.
   *
   * @param {String} field
   * @param {String} [direction='ASC']
   *
   * @returns {AbstractRepository}
   */
  setSort(sorts = []) {
    if (Array.isArray(sorts)) {
      this.sorts = sorts;
    }

    return this;
  }

  /**
   * Model getter.
   *
   * @returns {Model}
   */
  getModel() {
    return this.model;
  }

  /**
   * Remove the scopes of model before calling
   * a getter method.
   *
   * @returns {Model}
   */
  unscoped() {
    this.model = this.model.scope(null);

    return this;
  }

  /**
   * Build a Model instance from the payload.
   *
   * @param {Object} payload
   *
   * @returns {Model}
   */
  build(payload) {
    return this.model.build(payload);
  }

  /**
   * Create a model record to the database.
   *
   * @param {Object} model
   * @param {Object} transaction
   *
   * @returns {Promise<Object>}
   */
  create(model, transaction) {
    return this.model.create(model, { transaction });
  }

  /**
   * Create multiple model records to the database.
   *
   * @param {Array} modelsPayload
   *
   * @returns {Promise<Array>}
   */
  createMany(modelsPayload) {
    return new Promise((resolve, reject) => {
      this.model
        .bulkCreate(modelsPayload)
        .then((data) => resolve(data))
        .catch((error) => reject(error));
    });
  }

  /**
   * Update a model record to the database.
   *
   * @param {Object} model
   * @param {Object} newData
   *
   * @returns {Promise<Object>}
   */
  async update(model, newData = {}) {
    if ('update' in model) {
      const fields = Object.keys(newData);
      const rawAttributes = model?.rawAttributes || {};
      const keys = Object.keys(rawAttributes);

      for (let i = 0; i < keys.length; i += 1) {
        const key = keys[i];
        const attr = rawAttributes[key];

        if (attr.type.key === DataTypes.JSONB.key && fields.includes(key)) {
          model.changed(key, true);
        }
      }

      return model.update(newData);
    }

    const { primaryKeyAttributes } = this.model;
    const filters = {};

    for (let i = 0; i < primaryKeyAttributes.length; i += 1) {
      const key = primaryKeyAttributes[i];
      filters[key] = model[key];
    }

    const [, affectedRows] = await this.model.update(newData, {
      where: filters,
      returning: true,
    });

    return affectedRows ? affectedRows[0] || model : model;
  }

  async updateManyById(ids, newData = {}) {
    return this.updateValues(newData, { id: ids });
  }

  async updateMany(items) {
    const attributes = Object.keys(this.model.rawAttributes);
    const updateFields = attributes.filter(
      (attr) => !['id', 'createdAt'].includes(attr),
    );
    return new Promise((resolve, reject) => {
      this.model
        .bulkCreate(items, { updateOnDuplicate: updateFields })
        .then((data) => resolve(data))
        .catch((error) => reject(error));
    });
  }

  /**
   * Update values of attributes given.
   *
   * @param {Object} attributes
   * @param {Object} where
   *
   * @returns {Promise<Integer|Null>}
   */
  updateValues(attributes, where = {}) {
    return new Promise((resolve, reject) => {
      if (Object.keys(where).length === 0) {
        resolve(0);
      }

      this.model
        .update(attributes, { where })
        .then((rows) => resolve(rows))
        .catch((error) => reject(error));
    });
  }

  /**
   * Manually trigger update to to update "updatedAt" field.
   *
   * @param {Object} model
   *
   * @returns {Promise<Object>}
   */
  triggerModelUpdate(model) {
    model.changed('updatedAt', true);

    return this.update(model, { updatedAt: Sequelize.fn('NOW') });
  }

  /**
   * Delete a model record by id.
   *
   * @param {Integer} id
   *
   * @returns {Promise<Object>}
   */
  deleteById(id) {
    return this.delete({ where: { id } });
  }

  /**
   * Delete model records by ids.
   *
   * @param {Array} id
   *
   * @returns {Promise<Integer>}
   */
  deleteByIds(ids) {
    return this.delete({ where: { id: ids } });
  }

  /**
   * Delete a model record to the database cascading associations.
   *
   * @param {Object} opts
   *
   * @returns {Promise<Object>}
   */
  delete(opts = {}) {
    return new Promise((resolve, reject) => {
      this.model
        .destroy(opts)
        .then((data) => resolve(data))
        .catch((error) => reject(error));
    });
  }

  /**
   * Get record count that matches provided opts.
   *
   * @param {Object} opts
   *
   * @returns {Promise<any>}
   */
  count(opts = {}) {
    return new Promise((resolve, reject) => {
      this.model
        .count(this.getOpts(opts))
        .then((data) => resolve(data))
        .catch((error) => reject(error));
    });
  }

  /**
   * Generic getter for all.
   *
   * @param {Object} opts
   *
   * @returns {Promise<Array>}
   */
  all(opts = {}) {
    return new Promise((resolve, reject) => {
      let method = 'findAll';

      if (this.getPageOpts() !== null) {
        method = 'findAndCountAll';
        Object.assign(opts, { ...this.getPageOpts() });
      }

      this.model[method](this.getOpts(opts))
        .then((data) => resolve(data))
        .catch((error) => reject(error));
    });
  }

  /**
   * Generic getter for one model.
   *
   * @param {Object} opts
   *
   * @returns {Promise<Object>}
   */
  getOne(opts = {}) {
    return new Promise((resolve, reject) => {
      this.model
        .findOne(this.getOpts(opts))
        .then((data) => resolve(data))
        .catch((error) => reject(error));
    });
  }

  setTransaction(transaction) {
    this.transaction = transaction;
    return this;
  }

  /**
   * Attempt to get models by valid ids.
   * We will only return existing models with the id.
   *
   * @param {Array} ids
   *
   * @returns {Promise<Array>}
   */
  getByIds(ids = []) {
    const filtered = ids.filter((id) => {
      const num = typeof id === 'string' ? parseInt(id, 10) : id;

      return !Number.isNaN(num) && typeof num === 'number';
    });

    return this.all({ where: { id: { [Op.in]: filtered } } });
  }

  /**
   * Generic single getter for a record by id.
   *
   * @param {Integer} id
   *
   * @returns {Promise<Object>}
   */
  getById(id) {
    return this.getOne({ where: { id } });
  }

  /**
   * Add model id to the filters
   *
   * @param {Integer} id
   *
   * @returns {AbstractRepository}
   */
  filterById(id) {
    this.filters = Object.assign(this.filters, { id });

    return this;
  }

  /**
   * Add model ids to the filters
   *
   * @param {Array} id
   *
   * @returns {AbstractRepository}
   */
  filterByIds(ids) {
    this.filters = Object.assign(this.filters, { id: { [Op.in]: ids } });

    return this;
  }

  filterByGreaterThatId(id) {
    this.filters = Object.assign(this.filters, {
      id: {
        [Op.gt]: id,
      },
    });

    return this;
  }

  /**
   * Get the latest record by the given field.
   *
   * @param {String} [field='id']
   *
   * @returns {Promise<Object|Null>}
   */
  async latest(field = 'id') {
    return this
      .setSort([]) // fresh sort
      .sortBy(field, 'DESC')
      .getOne();
  }

  /**
   * Get the latest record by the given field.
   *
   * @param {String} [field='id']
   *
   * @returns {Promise<Object|Null>}
   */
  async first(field = 'id') {
    return this
      .setSort([]) // fresh sort
      .sortBy(field, 'ASC')
      .getOne();
  }

  /**
   * Generate the opts to be used in the queries. This method adds
   * the current "this.filters" to the where clause provded on "overrides".
   * The "where" property passed on to the "overrides" will always
   * supercede the current "this.filters".
   *
   * @private
   * @param {Object} [overrides={}]
   *
   * @returns
   */
  getOpts(overrides = {}) {
    const where = overrides.where ? overrides.where : {};
    const opts = {
      where: { ...this.filters, ...where },
      order: this.sorts,
      ...overrides,
    };

    // reset applied filters and sort for subsequent repository calls
    this.setFilters({});
    this.setSort([]);
    this.page = {};

    return opts;
  }
}

export default AbstractRepository;
