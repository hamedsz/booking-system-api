import EventBus from '../EventBus';

class BullMQEventBus extends EventBus {
  constructor(queue) {
    super();
    this.queue = queue;
  }

  async publish(event, options = {}) {
    await this.queue.add(event.name, event.payload, {
      attempts: options.attempts || 3,
      delay: options.delay || 0,
    });
  }
}

module.exports = BullMQEventBus;
