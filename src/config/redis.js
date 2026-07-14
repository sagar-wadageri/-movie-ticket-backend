const redis = require('redis');
const dotenv = require('dotenv');

dotenv.config();

// Create Redis client - FIXED for older Redis versions
const redisClient = redis.createClient({
    url: `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`,
    legacyMode: true  // This fixes the HELLO command issue!
});

// Handle errors
redisClient.on('error', (err) => {
    console.error('❌ Redis error:', err.message);
});

// Connect to Redis
const connectRedis = async () => {
    try {
        await redisClient.connect();
        console.log('✅ Redis connected successfully');
        return true;
    } catch (error) {
        console.error('❌ Redis connection failed:', error.message);
        return false;
    }
};

// Helper functions - FIXED for legacy mode
const setCache = async (key, value, ttl = 3600) => {
    try {
        await redisClient.setEx(key, ttl, JSON.stringify(value));
        return true;
    } catch (error) {
        console.error('Cache set error:', error);
        return false;
    }
};

const getCache = async (key) => {
    try {
        const data = await redisClient.get(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('Cache get error:', error);
        return null;
    }
};

const deleteCache = async (key) => {
    try {
        await redisClient.del(key);
        return true;
    } catch (error) {
        console.error('Cache delete error:', error);
        return false;
    }
};

// Distributed lock for seat booking
const acquireLock = async (key, ttl = 5000) => {
    try {
        const result = await redisClient.set(key, 'locked', {
            NX: true,
            PX: ttl
        });
        return result === 'OK';
    } catch (error) {
        console.error('Lock acquire error:', error);
        return false;
    }
};

const releaseLock = async (key) => {
    try {
        await redisClient.del(key);
        return true;
    } catch (error) {
        console.error('Lock release error:', error);
        return false;
    }
};

module.exports = {
    redisClient,
    connectRedis,
    setCache,
    getCache,
    deleteCache,
    acquireLock,
    releaseLock
};