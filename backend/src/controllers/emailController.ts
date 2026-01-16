import { Request, Response } from 'express';
import { prisma } from '../config/db';
import { emailQueue, emailQueueName } from '../queue/emailQueue';
import fs from 'fs';
import csv from 'csv-parser';

interface ScheduleRequest {
    subject: string;
    body: string;
    startTime?: string; // ISO string
    delayBetweenEmails?: number; // Seconds
    hourlyLimit?: number; // Override if needed (not fully impl in worker yet, keeps global)
    recipients?: string[];
}

export const scheduleEmails = async (req: Request, res: Response) => {
    try {
        const { subject, body, startTime, delayBetweenEmails = 0 } = req.body;
        let recipients: string[] = [];

        // 1. Handle File Upload (CSV)
        console.log('Request File:', (req as any).file);
        console.log('Request Body:', req.body);

        if ((req as any).file) {
            const results: any[] = [];
            await new Promise((resolve, reject) => {
                fs.createReadStream((req as any).file!.path)
                    .pipe(csv())
                    .on('data', (data) => results.push(data))
                    .on('end', resolve)
                    .on('error', reject);
            });

            console.log('CSV Results:', results);

            // Assume CSV has 'email' column (case-insensitive check)
            recipients = results.map((r: any) => {
                // Find key that matches 'email' case-insensitively
                const key = Object.keys(r).find(k => k.toLowerCase() === 'email');
                return key ? r[key] : null;
            }).filter(Boolean);

            console.log('Extracted Recipients:', recipients);

            // Cleanup file
            fs.unlinkSync((req as any).file.path);
        } else if (req.body.recipients) {
            recipients = Array.isArray(req.body.recipients) ? req.body.recipients : [req.body.recipients];
        }

        if (!recipients.length) {
            console.error('No recipients found after parsing');
            return res.status(400).json({ error: 'No recipients found. Please upload a CSV with an "email" column.' });
        }

        // 2. Schedule Jobs
        const startDelay = startTime ? new Date(startTime).getTime() - Date.now() : 0;
        const initialDelay = Math.max(0, startDelay);

        // Create a user if not exists (mock for now, or use req.user if auth implemented)
        // We'll Create one dummy user to link jobs
        let user = await prisma.user.findFirst();
        if (!user) {
            user = await prisma.user.create({
                data: { email: 'demo@example.com', name: 'Demo User' }
            });
        }

        const jobs = await Promise.all(recipients.map(async (recipient, index) => {
            // Calculate delay: Initial Start Time + (Index * Gap)
            const specificDelay = initialDelay + (index * (delayBetweenEmails * 1000));

            const scheduledTime = new Date(Date.now() + specificDelay);

            // Create Job in DB
            const jobRecord = await prisma.job.create({
                data: {
                    userId: user!.id,
                    recipient,
                    subject,
                    body,
                    status: 'PENDING',
                    scheduledAt: scheduledTime,
                }
            });

            // Add to BullMQ
            await emailQueue.add('send-email', {
                recipient,
                subject,
                body,
                jobIdInDb: jobRecord.id
            }, {
                delay: specificDelay,
                jobId: jobRecord.id // Use DB ID as BullMQ ID for easier tracking
            });

            return jobRecord;
        }));

        res.json({
            message: `Scheduled ${jobs.length} emails`,
            jobs: jobs.map((j: any) => ({ id: j.id, recipient: j.recipient, scheduledAt: j.scheduledAt }))
        });

    } catch (error) {
        console.error('Error scheduling emails:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getScheduledEmails = async (req: Request, res: Response) => {
    try {
        const jobs = await prisma.job.findMany({
            where: { status: 'PENDING' },
            orderBy: { scheduledAt: 'asc' }
        });
        res.json(jobs);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getSentEmails = async (req: Request, res: Response) => {
    try {
        const jobs = await prisma.job.findMany({
            where: { status: { in: ['SENT', 'FAILED'] } },
            orderBy: { sentAt: 'desc' }
        });
        res.json(jobs);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
