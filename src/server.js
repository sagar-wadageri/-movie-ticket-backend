const app = require('./app');
const { testConnection } = require('./config/database');
const { connectRedis } = require('./config/redis');
const dotenv = require('dotenv');

dotenv.config();

const PORT = process.env.PORT || 5000;

// Start server
const startServer = async () => {
    try {
        // Test MySQL connection
        const dbConnected = await testConnection();
        if (!dbConnected) {
            console.error('❌ Server starting without database connection');
        }

        // Test Redis connection
       // const redisConnected = await connectRedis();
        //if (!redisConnected) {
        //    console.error('❌ Server starting without Redis connection');
        //}

        // Start listening
        app.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
            console.log(`📊 Environment: ${process.env.NODE_ENV}`);
            console.log('✅ All systems ready!');
        });

    } catch (error) {
        console.error('❌ Server startup failed:', error.message);
        process.exit(1);
    }
};

startServer();