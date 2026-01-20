import { VectorDBClient } from '../vectordb/client';
import { Document } from '../types/index';

class QueryEngine {
    private client: VectorDBClient;

    constructor() {
        this.client = new VectorDBClient();
    }

    async queryDocuments(query: string): Promise<Document[]> {
        try {
            const results = await this.client.query(query);
            return results;
        } catch (error) {
            console.error('Error querying documents:', error);
            throw new Error('Query failed');
        }
    }
}

export default QueryEngine;