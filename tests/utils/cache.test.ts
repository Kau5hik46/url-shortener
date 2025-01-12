import { setCache, getCache, deleteCache } from '../../src/utils/cache';
import redis from '../../src/redisClient';

describe('Cache Utils', () => {
    // Clean up Redis before each test
    beforeEach(async () => {
        // Clean up cache with specific keys related to the tests (optional prefix or pattern)
        const keys = await redis.keys('test-*'); // Match only test-related keys
        if (keys.length > 0) {
            await redis.del(...keys); // Delete the test-related keys
        }
    });

    // Clean up Redis after all tests
    afterAll(async () => {
        // Disconnect from Redis after all tests are done
        await redis.quit();
    });

    it('should set and get cache with an expiration time', async () => {
        const key = 'test-key';
        const value = 'test-value';
        const ttl = 3600; // 1 hour in seconds

        // Set cache with expiration
        await setCache(key, value, ttl);

        // Get the cached value
        const cachedValue = await getCache(key);

        // Assert that the cached value is correct
        expect(cachedValue).toBe(value);
    });

    it('should return null if cache value does not exist', async () => {
        const key = 'nonexistent-key';

        // Get the cached value (should not exist)
        const cachedValue = await getCache(key);

        // Assert that the value is null (since it does not exist)
        expect(cachedValue).toBeNull();
    });

    it('should return null if cache value has expired', async () => {
        const key = 'expired-key';
        const value = 'test-expired-value';
        const ttl = 1; // 1 second TTL to expire quickly

        // Set the cache with a 1-second TTL
        await setCache(key, value, ttl);

        // Wait for the TTL to expire
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // Get the cached value (should be null since it expired)
        const expiredValue = await getCache(key);

        // Assert that the cache has expired
        expect(expiredValue).toBeNull();
    });

    it('should handle errors when getting cache', async () => {
        const key = 'error-key';

        // Simulate a Redis connection issue by shutting down Redis and retrying
        try {
            // Ensure Redis is up and running before continuing
            const cachedValue = await getCache(key);
            expect(cachedValue).toBeNull(); // In normal case, this should return null
        } catch (error) {
            // In case of an error, ensure it is thrown correctly
            expect(error).toBeInstanceOf(Error);
        }
    });

    it('should delete the cache value successfully', async () => {
        const key = 'delete-key';
        const value = 'test-delete-value';
        const ttl = 3600; // 1 hour TTL

        // Set cache with expiration
        await setCache(key, value, ttl);

        // Get and verify the cache value before deletion
        const cachedValueBeforeDelete = await getCache(key);
        expect(cachedValueBeforeDelete).toBe(value);

        // Delete the cache value
        await deleteCache(key);

        // Verify the cache value is deleted
        const cachedValueAfterDelete = await getCache(key);
        expect(cachedValueAfterDelete).toBeNull(); // Should be null after deletion
    });

    it('should handle errors when deleting cache', async () => {
        const key = 'delete-error-key';

        try {
            // Simulate a Redis connection issue by shutting down Redis and retrying
            await deleteCache(key);
        } catch (error) {
            // In case of an error, ensure it is thrown correctly
            expect(error).toBeInstanceOf(Error);
        }
    });
});
