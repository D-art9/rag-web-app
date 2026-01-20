import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import path from 'path';
import DocumentModel from './models/Document';
import { getVectorDBClient } from './vectordb/client';

// Load env vars
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const clearAllData = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI is not defined');
        }

        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✓ Connected to MongoDB.');

        // Clear MongoDB
        const result = await DocumentModel.deleteMany({});
        console.log(`✓ Deleted ${result.deletedCount} documents from MongoDB.`);

        // Clear Vector DB
        console.log('Clearing vector database...');
        const vectorDB = getVectorDBClient();
        await vectorDB.clearAll();
        console.log('✓ Vector database cleared.');

        await mongoose.disconnect();
        console.log('✓ Disconnected. All data cleared!');
    } catch (error) {
        console.error('Error clearing data:', error);
        process.exit(1);
    }
};

clearAllData();
