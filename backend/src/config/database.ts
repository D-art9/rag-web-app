import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/scriptyt';

// Debug: Log the URI (masking password) to verify Env Var is loaded
const maskedURI = MONGODB_URI.replace(/:([^:@]+)@/, ':****@');
console.log(`\n\n*** DB CONNECTION DEBUG ***\nAttempting to connect to: ${maskedURI}\n***************************\n`);

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
        // Throw error so server.ts can exit and Render can restart
        throw error;
    }
};

export default mongoose.connection;