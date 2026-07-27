export default class InvalidRefreshToken extends Error {
  constructor() {
    super('Invalid refresh token');
    this.name = 'InvalidRefreshToken';
  }
}
