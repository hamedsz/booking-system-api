class EventDispatcher {
  constructor(eventBus) {
    this.eventBus = eventBus;
  }

  async dispatch(event, options = {}) {
    return this.eventBus.publish(event, options);
  }
}

module.exports = EventDispatcher;
