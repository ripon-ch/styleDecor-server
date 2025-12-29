// File: server.js
const app = require('./src/app'); // Changed from import to require
const connectDB = require('./src/config/database');
const logger = require('./src/utils/logger');

const PORT = process.env.PORT || 5000;

// Disable ETag to prevent 304 cache issue
app.set("etag", false);

// Connect to database
connectDB();

const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
});

// Error Handling
process.on("unhandledRejection", err => {
    console.error(`❌ Unhandled Rejection: ${err.message}`);
    server.close(() => process.exit(1));
});

process.on("uncaughtException", err => {
    console.error(`❌ Uncaught Exception: ${err.message}`);
    process.exit(1);
});