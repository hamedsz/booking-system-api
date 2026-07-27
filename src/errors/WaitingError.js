export default class WaitingError extends Error {
  constructor(message) {
    super(message);
    this.name = 'CustomError';
  }
}
