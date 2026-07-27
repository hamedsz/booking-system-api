export default class MentorNotAcceptBookingError extends Error {
  constructor() {
    super('Mentor not accept booking');
    this.name = 'MentorNotAcceptBookingError';
  }
}
