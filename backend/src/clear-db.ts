import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import path from 'path';
import DocumentModel from './models/Document';

// Load env vars
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const clearDb = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI is not defined');
        }
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB.');

        const result = await DocumentModel.deleteMany({});
        console.log(`Deleted ${result.deletedCount} documents.`);

        await mongoose.disconnect();
        console.log('Disconnected.');
    } catch (error) {
        console.error('Error clearing DB:', error);
        process.exit(1);
    }
};

clearDb();
