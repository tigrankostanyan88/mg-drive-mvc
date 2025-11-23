const redis = require("./redis");

module.exports = {
    async get(key) {
        try {
            const data = await redis.get(key);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            return null;
        }
    },

    async set(key, value, ttl = 60) { 
        try {
            await redis.setEx(key, ttl, JSON.stringify(value));
        } catch (e) {}
    }
};
