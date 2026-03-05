import Redis from "ioredis";

const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined;
};

function createRedisClient(): Redis {
  const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
  const client = new Redis(redisUrl, {
    maxRetriesPerRequest: 3,
    enableReadyCheck: false,
    lazyConnect: true,
  });

  client.on("error", (err) => {
    if (process.env.NODE_ENV !== "test") {
      console.warn("Redis connection error:", err.message);
    }
  });

  return client;
}

export const redis = globalForRedis.redis ?? createRedisClient();

if (process.env.NODE_ENV !== "production") globalForRedis.redis = redis;

export async function getCached<T>(key: string): Promise<T | null> {
  try {
    const cached = await redis.get(key);
    if (cached) return JSON.parse(cached) as T;
  } catch {
    // Redis unavailable, skip cache
  }
  return null;
}

export async function setCache(
  key: string,
  value: unknown,
  ttlSeconds = 60
): Promise<void> {
  try {
    await redis.setex(key, ttlSeconds, JSON.stringify(value));
  } catch {
    // Redis unavailable, skip cache
  }
}

export async function invalidateCache(key: string): Promise<void> {
  try {
    await redis.del(key);
  } catch {
    // Redis unavailable, skip cache
  }
}
