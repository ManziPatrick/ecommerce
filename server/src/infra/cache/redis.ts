import Redis from "ioredis";
import * as dotenv from "dotenv";

dotenv.config();

let redisClient: Redis;

const REDIS_URL = process.env.REDIS_URL;

if (REDIS_URL) {
  console.log("🔌 Initializing Redis connection...");
  
  // Create Redis instance
  redisClient = new Redis(REDIS_URL, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    retryStrategy(times) {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
    // SSL is typically required for 'rediss://' URLs
    // If the URL is rediss://, ioredis handles it, but sometimes explicit options help
    tls: REDIS_URL.startsWith("rediss://") 
      ? { rejectUnauthorized: false } 
      : undefined
  });

  redisClient.on("connect", () => {
    console.log("✅ Redis connected successfully");
  });

  redisClient.on("ready", () => {
    console.log("✅ Redis client is ready");
  });

  redisClient.on("error", (err) => {
    console.error("❌ Redis connection error:", err);
  });
} else {
  console.warn("⚠️ REDIS_URL not found. Falling back to Mock Redis.");
  console.warn("   (Sessions will NOT persist across restarts!)");

  // Simple mock compatible with basic Redis commands used by sessions/queues
  const mockRedis: any = {
    on: (event: string, callback: Function) => {
      if (event === 'connect' || event === 'ready') {
        setTimeout(() => callback(), 100);
      }
      return mockRedis;
    },
    connect: () => Promise.resolve(),
    quit: () => Promise.resolve('OK'),
    get: () => Promise.resolve(null),
    set: () => Promise.resolve('OK'),
    del: () => Promise.resolve(1),
    status: 'ready',
    duplicate: () => mockRedis 
  };
  
  redisClient = mockRedis;
}

export default redisClient;
