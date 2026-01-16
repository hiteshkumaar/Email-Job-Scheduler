import { Redis } from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const getRedisConfig = () => {
    if (process.env.REDIS_URL) {
        return process.env.REDIS_URL;
    }
    return {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        maxRetriesPerRequest: null,
    };
};

const connectionOptions = {
    maxRetriesPerRequest: null, // Required for BullMQ
};

export const redisConnection = process.env.REDIS_URL
    ? new Redis(process.env.REDIS_URL, connectionOptions)
    : new Redis({
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        ...connectionOptions
    });

export const createRedisConnection = () => {
    if (process.env.REDIS_URL) {
        return new Redis(process.env.REDIS_URL, connectionOptions);
    }
    return new Redis({
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        ...connectionOptions
    });
};
