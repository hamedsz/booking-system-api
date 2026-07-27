import 'dotenv/config';
import { Worker } from 'bullmq';
import { activeWorkers } from './workers';
import redisConfig from './config/queue';
import emailService from './services/external/EmailService';

async function startEngine() {
  console.log('🚀 Dynamic Background Process Engine Initializing...');

  await emailService.init();

  // Loop through and automatically configure all active queues found in our registry
  activeWorkers.forEach((config) => {
    const { queueName, handlers, opts } = config;

    console.log(`[Queue Setup] Spinning up worker instances for channel: "${queueName}"`);

    const workerInstance = new Worker(queueName, async (job) => {
      console.log(`[${queueName}] Processing Job ID: ${job.id} - Task Name: "${job.name}"`);

      const executeJob = handlers[job.name];

      if (!executeJob) {
        throw new Error(`Job type "${job.name}" has no registered handler inside queue "${queueName}"`);
      }

      // Execute the clean job logic
      await executeJob(job);
    }, {
      ...opts,
      connection: redisConfig,
    });

    // Attach centralized monitoring events automatically to this instance loop
    workerInstance.on('completed', (job) => {
      console.log(`✅ [${queueName}][Success] Job ID ${job.id} finalized successfully.`);
    });

    workerInstance.on('failed', (job, err) => {
      console.error(`❌ [${queueName}][Failed] Job ID ${job.id} failed permanently. Error: ${err.message}`);
    });

    workerInstance.on('error', (err) => {
      console.error(`🚨 Fatal Engine Exception inside Queue Structure "${queueName}":`, err);
    });
  });
}

startEngine().catch((err) => {
  console.error('🚨 Fatal Engine Boot Exception:', err);
  process.exit(1);
});
