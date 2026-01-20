import { getVectorDBClient } from './vectordb/client';
import DocumentModel from './models/Document';

// This script clears the vector database
// Run MongoDB clearing separately through the API or mongo shell

const clearVectorDB = async () => {
    try {
        console.log('[CLEAR] Clearing vector database...');
        const vectorDB = getVectorDBClient();
        await vectorDB.clearAll();
        console.log('[CLEAR] ✓ Vector database cleared successfully!');
        console.log('[CLEAR] Note: MongoDB documents still exist. Delete them via API or manually.');
    } catch (error) {
        console.error('[CLEAR] Error:', error);
    }
};

clearVectorDB();
