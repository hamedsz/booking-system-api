export default class EmailExistsError extends Error {
  constructor() {
    super('Email exists');
    this.name = 'EmailExistsError';
  }
}
