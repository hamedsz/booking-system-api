export default class SlotNotAvailableError extends Error {
  constructor() {
    super('Slot not available');
    this.name = 'SlotNotAvailableError';
  }
}
