import { Queue } from 'bullmq';
import BullMQEventBus from './events/bullMQ/BullMQEventBus';
import EventDispatcher from './events/EventDispatcher';
import redisConfig from '../config/queue';

export const queue = new Queue('domain-events', { connection: redisConfig });
export const eventBus = new BullMQEventBus(queue);
export const dispatcher = new EventDispatcher(eventBus);
