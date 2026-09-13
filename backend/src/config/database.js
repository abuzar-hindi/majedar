import mongoose from 'mongoose';

//Connect to MongoDB database.
export const connectDatabase = async () => {
    try {
        if (mongoose.connection.readyState === 1) {
            console.log('MongoDB is already connected.');
            return mongoose.connection;
        }

        const mongoUri = process.env.MONGODB_URI;
        if (!mongoUri) {
            throw new Error('MONGODB_URI is not defined in environment variables');
        }

        const conn = await mongoose.connect(mongoUri);
        console.log(`MongoDB connected successfully: ${conn.connection.host}`);
        return conn;
    } catch (error) {
        console.error(`MongoDB connection error: ${error.message}`);
        throw error;
    }
};


//Disconnect from MongoDB database.

export const disconnectDatabase = async () => {
    try {
        if (mongoose.connection.readyState === 0) {
            console.log('MongoDB is already disconnected.');
            return;
        }

        await mongoose.disconnect();
        console.log('MongoDB disconnected successfully.');
    } catch (error) {
        console.error(`MongoDB disconnection error: ${error.message}`);
        throw error;
    }
};

// Backward compatibility alias
export const connectDB = connectDatabase;