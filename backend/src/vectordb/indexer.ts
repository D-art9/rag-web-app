import { Embedding } from '../types/index';
import { VectorDBClient } from '../vectordb/client';

class Indexer {
    private client: VectorDBClient;

    constructor() {
        this.client = new VectorDBClient();
    }

    async indexEmbeddings(embeddings: Embedding[]): Promise<void> {
        for (const embedding of embeddings) {
            await this.client.storeEmbedding(embedding);
        }
    }

    async updateIndex(embedding: Embedding): Promise<void> {
        await this.client.updateEmbedding(embedding);
    }

    async deleteIndex(embeddingId: string): Promise<void> {
        await this.client.deleteEmbedding(embeddingId);
    }
}

export default Indexer;