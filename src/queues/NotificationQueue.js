import { Queue } from 'bullmq';
import redisConfig from '../config/queue';

/**
 * Initialize the BullMQ Queue.
 * The first argument 'NotificationQueue' is the unique name of this queue channel.
 * The worker process will listen to this exact same name.
 */
const notificationQueue = new Queue('NotificationQueue', {
  connection: redisConfig,
  defaultJobOptions: {
    // Sane, production-ready defaults for all background jobs in this queue
    removeOnComplete: {
      age: 3600, // Keep completed job logs for 1 hour for debugging, then auto-delete
      count: 1000, // Or keep a maximum of 1000 logs
    },
    removeOnFail: {
      age: 24 * 3600, // Keep failed job records for 24 hours so you can inspect/retry them
    },
  },
});

// Centralized error listener for the queue producer interface itself
notificationQueue.on('error', (err) => {
  console.error('Notification Queue System Error:', err);
});

export default notificationQueue;
