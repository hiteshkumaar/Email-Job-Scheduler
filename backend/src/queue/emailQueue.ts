import { Queue } from 'bullmq';
import { redisConnection } from '../config/redis';

export const emailQueueName = 'email-send-queue';

export const emailQueue = new Queue(emailQueueName, {
    connection: redisConnection,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 1000,
        },
        removeOnComplete: false, // Keep history for a while or manage manually
        removeOnFail: false,
    },
});
