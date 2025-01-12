import redis from '../redisClient';

export async function setCache(key: string, value: string, ttl: number) {
    await redis.set(key, value, 'EX', ttl);
}

export async function getCache(key: string): Promise<string | null> {
    return redis.get(key);
}

export async function deleteCache(key: string) {
    await redis.del(key);
}
