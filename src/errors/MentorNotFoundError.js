export default class MentorNotFoundError extends Error {
  constructor() {
    super('Mentor not found');
    this.name = 'MentorNotFoundError';
  }
}
