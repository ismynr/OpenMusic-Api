const redis = require('redis');

class CacheService {
    constructor() {
        this._client = redis.createClient({
            socket: {
                host: process.env.REDIS_SERVER,
            },
        });
        this._client.on('error', (error) => {
            console.error(error);
        });
        this._client.connect();
    }

    /**
     * This function sets a key to a value in the Redis cache, and expires it in 1800 seconds.
     * @param key - The key to store the value under.
     * @param value - The value to be stored in the cache.
     * @param [expirationInSecond=1800] - The number of seconds until the key expires.
     */
    async set(key, value, expirationInSecond = 1800) {
        await this._client.set(key, value, {
            EX: expirationInSecond,
        });
    }

    /**
     * Get cache from redis, if the result is null, throw an error, otherwise return the result
     * @param key - The key to get the value from.
     * @returns The result of the get method is being returned.
     */
    async get(key) {
        const result = await this._client.get(key);
        if (result === null) throw new Error('Cache tidak ditemukan');
        return result;
    }

    /**
     * It deletes the key from the Redis database
     * @param key - The key to delete
     * @returns The return value is a promise.
     */
    delete(key) {
        return this._client.del(key);
    }
}

module.exports = CacheService;
