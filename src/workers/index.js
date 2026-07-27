// src/workers/index.js
import notificationWorker from './NotificationWorker';

// Register all active workers here
export const activeWorkers = [
  notificationWorker,
];

export default activeWorkers;
