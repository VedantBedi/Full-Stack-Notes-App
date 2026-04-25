// backend/src/adapters/CacheAdapter.js
import { Redis } from '@upstash/redis';

class UpstashRedisAdapter {
  constructor() {
    this.client = Redis.fromEnv(); 
  }

  async get(key) {
    try {
      return await this.client.get(key);
    } catch (error) {
      console.error("Cache GET error:", error);
      return null;
    }
  }

  async set(key, value, expirationSeconds = 3600) {
    try {
      await this.client.set(key, value, { ex: expirationSeconds });
    } catch (error) {
      console.error("Cache SET error:", error);
    }
  }

  async increment(key, windowSeconds) {
    try {
      const count = await this.client.incr(key);
      
      if (count === 1) {
        await this.client.expire(key, windowSeconds);
      }
      
      return count;
    } catch (error) {
      console.error("Cache INCREMENT error:", error);
      throw error;
    }
  }
}

export const cacheAdapter = new UpstashRedisAdapter();