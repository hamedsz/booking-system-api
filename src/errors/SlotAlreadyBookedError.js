export default class SlotAlreadyBookedError extends Error {
  constructor() {
    super('Slot already booked');
    this.name = 'SlotAlreadyBookedError';
  }
}
