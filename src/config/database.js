import mongoose from 'mongoose';
import logger from '../utils/logger.js'; // Ensure path and .js extension are correct

const MONGO_URI = process.env.MONGO_URI; 

const connectDB = async () => {
    // MongoDB connection options (leaving them commented out is fine as they are deprecated/defaulted)
    const options = {}; 

    try {
        if (!MONGO_URI) {
            throw new Error('MONGO_URI is not defined in environment variables.');
        }

        const conn = await mongoose.connect(MONGO_URI, options);

        logger.info(`MongoDB Connected: ${conn.connection.host}`);
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        
        // --- Connection Event Listeners ---
        
        mongoose.connection.on('error', (err) => {
            logger.error(`MongoDB connection error: ${err.message}`);
            console.error(`❌ MongoDB connection error: ${err.message}`);
        });

        mongoose.connection.on('disconnected', () => {
            logger.warn('MongoDB disconnected');
            console.warn('⚠️  MongoDB disconnected');
        });

        mongoose.connection.on('reconnected', () => {
            logger.info('MongoDB reconnected');
            console.log('✅ MongoDB reconnected');
        });

        // Add the Graceful Shutdown Handler: Closes the connection on app termination (SIGINT, e.g., Ctrl+C)
        process.on('SIGINT', async () => {
            await mongoose.connection.close();
            logger.info('MongoDB connection closed through app termination');
            console.log('👋 MongoDB connection closed through app termination');
            // Allow the process to exit after closing the database connection
            process.exit(0); 
        });

    } catch (error) {
        logger.error(`Error connecting to MongoDB: ${error.message}`);
        console.error(`❌ Error connecting to MongoDB: ${error.message}`);
        // Exit process immediately on failed database connection
        process.exit(1);
    }
};

export default connectDB;