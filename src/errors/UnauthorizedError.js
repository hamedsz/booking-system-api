import ApiError from './ApiError';

export default class UnauthorizedError extends ApiError {
  /**
   * Creates an instance of UnauthorizedError.
   *
   * @param {String|Number} code
   */
  constructor(code, message = 'Not allowed.') {
    super(401, 'authentication_error', code, message);
  }
}
