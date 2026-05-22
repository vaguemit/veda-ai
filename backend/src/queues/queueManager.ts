import { Queue, Worker } from 'bullmq';
import Redis from 'ioredis';
import dotenv from 'dotenv';
import { EventEmitter } from 'events';

dotenv.config();

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

let redisConnection: Redis | null = null;
let isRedisConnected = false;
let fallbackQueueMode = false;

// Custom Event Emitter to simulate BullMQ events when Redis is offline
export const localQueueEvents = new EventEmitter();

// In-memory queue list
const inMemoryQueue: { jobId: string; data: any }[] = [];

// Initialize Redis connection check
export async function initRedis() {
  return new Promise<void>((resolve) => {
    try {
      console.log(`Connecting to Redis at: ${REDIS_URL}...`);
      redisConnection = new Redis(REDIS_URL, {
        maxRetriesPerRequest: 1,
        connectTimeout: 2000, // 2 seconds timeout
        retryStrategy: () => null // Do not retry on initial failure
      });

      redisConnection.on('connect', () => {
        isRedisConnected = true;
        fallbackQueueMode = false;
        console.log('Redis Connected Successfully!');
        resolve();
      });

      redisConnection.on('error', (err) => {
        if (!isRedisConnected) {
          console.warn('Redis connection failed. Switching to Local In-Memory Queue Fallback.');
          isRedisConnected = false;
          fallbackQueueMode = true;
          resolve();
        }
      });
    } catch (error) {
      console.warn('Redis initialization error. Switching to Local In-Memory Queue Fallback.');
      fallbackQueueMode = true;
      resolve();
    }
  });
}

// Queue references
let assessmentQueue: Queue | null = null;

export function setupQueue(processJobCallback: (jobId: string, data: any) => Promise<void>) {
  if (!fallbackQueueMode && redisConnection) {
    try {
      assessmentQueue = new Queue('assessment-generation', {
        connection: redisConnection
      });
      
      console.log('BullMQ Queue Initialized.');

      // Setup the actual BullMQ Worker
      const worker = new Worker('assessment-generation', async (job) => {
        console.log(`BullMQ processing job ${job.id}`);
        await processJobCallback(job.id || '', job.data);
      }, {
        connection: redisConnection
      });

      worker.on('completed', (job) => {
        console.log(`Job ${job.id} completed successfully via BullMQ`);
      });

      worker.on('failed', (job, err) => {
        console.error(`Job ${job?.id} failed in BullMQ:`, err);
      });

    } catch (err) {
      console.error('Failed to create BullMQ. Falling back to local queue.', err);
      fallbackQueueMode = true;
    }
  }

  // Setup the memory queue processing loop if in fallback mode
  if (fallbackQueueMode) {
    console.log('In-Memory Queue loop initialized.');
    
    // Listen for new jobs added to local queue
    localQueueEvents.on('job:added', async (job) => {
      // Process jobs sequentially or concurrently. Let's process asynchronously.
      setImmediate(async () => {
        try {
          console.log(`In-Memory Queue processing job ${job.jobId}`);
          localQueueEvents.emit('active', { jobId: job.jobId });
          
          await processJobCallback(job.jobId, job.data);
          
          localQueueEvents.emit('completed', { jobId: job.jobId });
          console.log(`Job ${job.jobId} completed successfully via In-Memory Queue`);
        } catch (err) {
          localQueueEvents.emit('failed', { jobId: job.jobId, error: err });
          console.error(`Job ${job.jobId} failed in In-Memory Queue:`, err);
        }
      });
    });
  }
}

export async function addJobToQueue(jobId: string, data: any) {
  if (!fallbackQueueMode && assessmentQueue) {
    await assessmentQueue.add(jobId, data, { jobId });
    console.log(`Added job ${jobId} to BullMQ queue`);
  } else {
    // Local fallback
    inMemoryQueue.push({ jobId, data });
    console.log(`Added job ${jobId} to In-Memory queue`);
    localQueueEvents.emit('job:added', { jobId, data });
  }
}

export function isQueueFallbackMode() {
  return fallbackQueueMode;
}
