// File: server.js
// NOTE: dotenv loading is handled by the "nodemon -r dotenv/config" command in package.json.
// We remove the manual calls here to prevent conflicts.

import app from "./src/app.js";
import connectDB from "./src/config/database.js";
import logger from "./src/utils/logger.js";  // Ensure this file exists and uses 'export default'

const PORT = process.env.PORT || 5000;

// Connect to database
// process.env is now guaranteed to be loaded here.
connectDB();

// Start server
const server = app.listen(PORT, () => {
    logger.info(
        `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`
    );
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`📚 API Docs: http://localhost:${PORT}/api`);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", err => {
    logger.error(`Unhandled Rejection: ${err.message}`);
    console.error(`❌ Unhandled Rejection: ${err.message}`);
    server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on("uncaughtException", err => {
    logger.error(`Uncaught Exception: ${err.message}`);
    console.error(`❌ Uncaught Exception: ${err.message}`);
    process.exit(1);
});

// Graceful shutdown
process.on("SIGTERM", () => {
    logger.info("SIGTERM signal received. Closing server gracefully.");
    console.log("👋 SIGTERM signal received. Closing server gracefully.");
    server.close(() => {
        logger.info("Server closed");
        console.log("✅ Server closed");
        process.exit(0);
    });
});