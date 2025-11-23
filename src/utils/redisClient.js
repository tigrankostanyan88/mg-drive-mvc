const { createClient } = require("redis");

const redis = createClient({
    url: "redis://127.0.0.1:6379"
});

redis.on("error", err => {
    console.error("Redis error:", err);
});

// Connect only once, when file is loaded
(async () => {
    if (!redis.isOpen) {
        await redis.connect();
        console.log("Redis connected ✔");
    }
})();

module.exports = redis;