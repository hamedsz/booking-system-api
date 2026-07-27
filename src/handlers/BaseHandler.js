import Validator from 'validatorjs';
import ApiError from '../errors/ApiError';
import UnauthorizedError from '../errors/UnauthorizedError';
import { first } from '../utils/helper';

export default class BaseHandler {
  /**
   * Create ApiError with bad request status.
   *
   * @protected
   * @static
   * @param {String} type
   * @param {String} code
   * @param {String} message
   *
   * @returns {ApiError}
   */
  static createBadRequest(type, code, message) {
    return new ApiError(400, type, code, message);
  }

  /**
   * Create ApiError with bad request status.
   *
   * @protected
   * @static
   * @param {String} type
   * @param {String} code
   * @param {String} message
   *
   * @returns {ApiError}
   */
  static createAuthError(type, code, message) {
    return new ApiError(401, type, code, message);
  }

  /**
   * Get pagination parameters from request.
   *
   * @protected
   * @static
   * @param {Object} req
   *
   * @returns {Object|Null}
   */
  static getPagination(req) {
    const { page, pageSize, infinite } = req.query;

    if (Boolean(infinite) === true) {
      return null;
    }

    return {
      current: parseInt(page, 10) || 1,
      size: parseInt(pageSize, 10) || 15, // default limit
    };
  }

  /**
   * Return a list data with pagination node.
   *
   * @protected
   * @static
   * @param {Object} data
   * @param {Object} req
   * @param {Function|Null} [transform=null]
   *
   * @returns {Object}
   */
  static async listWithPagination(data, req, transform = null) {
    const { rows, count } = data;
    const pagination = {
      ...this.getPagination(req),
      total: count,
    };
    const list = transform ? await transform(rows, req) : rows;

    return { list, pagination };
  }

  /**
   * Create ApiError with not found status.
   *
   * @protected
   * @static
   * @param {String} code
   * @param {String} message
   *
   * @returns {ApiError}
   */
  static createNotFound(code, message) {
    return new ApiError(404, 'not_found_error', code, message);
  }

  /**
   * Create Unauthorized api error.
   *
   * @protected
   * @static
   * @param {String} code
   * @param {String} message
   *
   * @returns {UnauthorizedError}
   */
  static createUnauthorized(code, message) {
    return new UnauthorizedError(code, message);
  }

  /**
   * Create Forbidden api error.
   *
   * @protected
   * @static
   * @param {String} message
   *
   * @returns {ApiError}
   */
  static createForbidden(message) {
    return new ApiError(403, 'forbidden', 'forbidden', message);
  }

  /**
   * Create ApiError with bad request status.
   *
   * @protected
   * @static
   * @param {String} code
   * @param {String} message
   * @param {String} type
   *
   * @returns {ApiError}
   */
  static createValidationError(code, message, type = 'validation_error') {
    return this.createBadRequest(type, code, message);
  }

  static validate(body, rules, code, messages = {}) {
    const validation = new Validator(body, rules, messages);

    if (validation.fails()) {
      throw this.createValidationError(code, first(validation.errors.all()));
    }

    return true;
  }

  /**
   * Get valid options for listing records.
   * Options can include filters, sort, or paginate.
   *
   * @protected
   * @static
   * @param {Object} req
   * @param {Boolean} paginate
   *
   * @returns {Object}
   */
  static getListOpts(req, paginate = true) {
    const opts = {};
    const filters = this.getFilters(req);

    if (Object.keys(filters).length > 0) {
      opts.filters = filters;
    }

    const page = this.getPagination(req);

    if (paginate && page) {
      opts.page = page;
    }

    const sort = this.getSort(req);

    if (sort) {
      opts.sort = sort;
    }

    return opts;
  }

  /**
   * Get valid filters from the request.
   * This will be overriden depending on the handler.
   *
   * @protected
   * @static
   * @param {Object} _req
   *
   * @returns {Object}
   */
  static getFilters(_req) {
    return {};
  }

  /**
   * Get sort parameters from request.
   *
   * @protected
   * @static
   * @param {Object} req
   *
   * @returns {Array|Null}
   */
  static getSort(req) {
    const { sortField, sortOrder } = req.query;

    if (!sortField) {
      return null;
    }

    const sort = [sortField];

    if (sortOrder) {
      sort.push(sortOrder);
    }

    return sort;
  }
}
