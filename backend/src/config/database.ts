import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/scriptyt';

// Debug: Log the URI (masking password) to verify Env Var is loaded
const maskedURI = MONGODB_URI.replace(/:([^:@]+)@/, ':****@');
console.log(`[DB] Attempting to connect to: ${maskedURI}`);

export const connectDB = async () => {
    try {
        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true,
            useFindAndModify: false,
        });
        console.log('MongoDB connected successfully.');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        console.log('Server will continue running without database connection.');
    }
};

export default mongoose.connection;