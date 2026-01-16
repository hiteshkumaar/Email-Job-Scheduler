import { Worker, Job } from 'bullmq';
import { emailQueueName } from '../queue/emailQueue';
import { redisConnection, createRedisConnection } from '../config/redis';
import { sendEmail } from '../utils/emailSender';
import { prisma } from '../config/db';

const MAX_EMAILS_PER_HOUR = Number(process.env.MAX_EMAILS_PER_HOUR) || 20; // Default low for testing
const MIN_DELAY_BETWEEN_EMAILS_MS = 2000; // 2 seconds

export const setupWorker = () => {
    const worker = new Worker(
        emailQueueName,
        async (job: Job) => {
            console.log(`Processing job ${job.id}: ${job.data.subject}`);

            const { recipient, subject, body, jobIdInDb } = job.data;

            // 1. Rate Limiting Check
            const currentHour = new Date().toISOString().slice(0, 13); // yyyy-mm-ddThh
            const rateLimitKey = `rate-limit:${currentHour}`;

            const currentCount = await redisConnection.incr(rateLimitKey);
            if (currentCount === 1) {
                await redisConnection.expire(rateLimitKey, 3600); // Expire in 1 hour
            }

            if (currentCount > MAX_EMAILS_PER_HOUR) {
                console.warn(`Rate limit exceeded for ${currentHour}. Rescheduling job ${job.id}.`);

                // Calculate delay to next hour
                const now = new Date();
                const nextHour = new Date(now);
                nextHour.setHours(now.getHours() + 1, 0, 0, 0);
                const delay = nextHour.getTime() - now.getTime();

                // Move to delayed
                await job.moveToDelayed(Date.now() + delay, job.token);
                return; // Stop processing this attempt
            }

            // 2. Artificial Delay (Throttling)
            await new Promise((resolve) => setTimeout(resolve, MIN_DELAY_BETWEEN_EMAILS_MS));

            // 3. Send Email
            try {
                await sendEmail(recipient, subject, body);

                // 4. Update DB
                if (jobIdInDb) {
                    await prisma.job.update({
                        where: { id: jobIdInDb },
                        data: {
                            status: 'SENT',
                            sentAt: new Date()
                        },
                    });
                }

                console.log(`Job ${job.id} completed. Email sent to ${recipient}.`);
            } catch (error) {
                console.error(`Failed to send email for job ${job.id}:`, error);
                if (jobIdInDb) {
                    await prisma.job.update({
                        where: { id: jobIdInDb },
                        data: {
                            status: 'FAILED',
                            failedAt: new Date(),
                            failReason: error instanceof Error ? error.message : 'Unknown error'
                        },
                    });
                }
                throw error; // Let BullMQ handle retry if configured
            }
        },
        {
            connection: createRedisConnection(), // Call factory to get new connection for worker
            concurrency: Number(process.env.WORKER_CONCURRENCY) || 5,
            limiter: {
                max: 10, // Max 10 jobs processed
                duration: 1000, // per 1 second (Just a safety net, our custom logic handles hour limit)
            }
        }
    );

    worker.on('failed', async (job, err) => {
        console.error(`Job ${job?.id} failed with error ${err.message}`);
    });

    return worker;
};
