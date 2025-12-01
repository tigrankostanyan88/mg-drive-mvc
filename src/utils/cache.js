const redis = require("./redis");

module.exports = {
    async get(key) {
        try {
            const raw = await redis.get(key);
            return raw ? JSON.parse(raw) : null;
        } catch (e) {
            console.error('Redis GET error:', e);
            return null;
        }
    },

    async set(key, value, ttl) {
        try {
            await redis.set(key, JSON.stringify(value), { EX: ttl });
        } catch (e) {
            console.error('Redis SET error:', e);
        }
    },

    async del(key) {
        try {
            await redis.del(key);
        } catch (e) {
            console.error('Redis DEL error:', e);
        }
    }
};
