import { embeddingService } from '../services/embeddingService';
import VectorModel from '../models/Vector';

interface VectorEntry {
    id: string;
    videoId: string;
    chunkIndex: number;
    text: string;
    embedding: number[];
    metadata: {
        title: string;
        url: string;
        thumbnail: string;
    };
}

/**
 * MongoDB-backed Vector Database Client
 * Uses cosine similarity on retrieved database embeddings for scoped search
 */
export class VectorDBClient {
    private isReady: boolean = false;

    async connect(): Promise<void> {
        this.isReady = true;
        console.log('[VECTORDB] ✓ MongoDB Vector Store active.');
    }

    /**
     * Generate embeddings for text via Gemini API
     */
    async generateEmbedding(text: string): Promise<number[]> {
        return await embeddingService.embedText(text);
    }

    /**
     * Cosine similarity with zero-vector guard to prevent NaN results
     */
    private cosineSimilarity(a: number[], b: number[]): number {
        let dotProduct = 0;
        let normA = 0;
        let normB = 0;

        for (let i = 0; i < a.length; i++) {
            dotProduct += a[i] * b[i];
            normA += a[i] * a[i];
            normB += b[i] * b[i];
        }

        if (normA === 0 || normB === 0) return 0;

        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }

    /**
     * Store embeddings for a video using HIGH-SPEED BATCHING in MongoDB.
     */
    async storeVideoEmbeddings(
        videoId: string,
        chunks: { text: string; index: number }[],
        metadata: { title: string; url: string; thumbnail: string }
    ): Promise<void> {
        console.log(`[VECTORDB] Generating TURBO embeddings for ${chunks.length} chunks (videoId: ${videoId})...`);

        try {
            const texts = chunks.map(c => c.text);
            const embeddings = await embeddingService.embedBatch(texts);

            const documentsToInsert = embeddings.map((embedding, i) => {
                const chunk = chunks[i];
                return {
                    videoId,
                    chunkIndex: chunk.index,
                    text: chunk.text,
                    embedding,
                    metadata
                };
            });

            // Bulk insert into MongoDB
            await VectorModel.insertMany(documentsToInsert);
            console.log(`[VECTORDB] ✓ [TURBO_SYNC_COMPLETE] Stored ${chunks.length} embeddings in MongoDB for: "${metadata.title}"`);

        } catch (error: any) {
            console.error(`[VECTORDB] ✗ Batch Embedding Failed:`, error.message);
            throw new Error(`Vector Storage Fault: ${error.message}`);
        }
    }

    /**
     * Perform semantic search
     */
    async search(
        query: string,
        videoId?: string,
        topK: number = 5
    ): Promise<Array<{ content: string; metadata: any; score: number }>> {
        console.log(`[VECTORDB] Searching for: "${query}"${videoId ? ` (videoId: ${videoId})` : ''}`);

        const queryEmbedding = await this.generateEmbedding(query);

        // Fetch candidates from MongoDB
        const queryFilter = videoId ? { videoId } : {};
        const candidates = await VectorModel.find(queryFilter).lean();

        if (candidates.length === 0) {
            console.log('[VECTORDB] No vectors found for search');
            return [];
        }

        const results = candidates.map(vector => ({
            content: vector.text,
            metadata: {
                videoId: vector.videoId,
                title: vector.metadata.title,
                url: vector.metadata.url,
                thumbnail: vector.metadata.thumbnail,
                chunkIndex: vector.chunkIndex
            },
            score: this.cosineSimilarity(queryEmbedding, vector.embedding)
        }));

        results.sort((a, b) => b.score - a.score);
        const topResults = results.slice(0, topK);

        console.log(`[VECTORDB] ✓ Found ${topResults.length} vectors (top score: ${topResults[0]?.score.toFixed(3)})`);

        return topResults;
    }

    /**
     * Delete embeddings for a specific video
     */
    async deleteVideoEmbeddings(videoId: string): Promise<void> {
        console.log(`[VECTORDB] Deleting embeddings for videoId: ${videoId}`);
        await VectorModel.deleteMany({ videoId });
        console.log(`[VECTORDB] ✓ Deleted embeddings for videoId: ${videoId}`);
    }

    /**
     * Clear all vectors
     */
    async clearAll(): Promise<void> {
        console.log('[VECTORDB] Clearing all embeddings...');
        await VectorModel.deleteMany({});
        console.log('[VECTORDB] ✓ All embeddings cleared');
    }
}

// Singleton instance
const vectorDBClient = new VectorDBClient();

export const connectToVectorDB = async () => {
    await vectorDBClient.connect();
};

export const getVectorDBClient = () => vectorDBClient;

export default vectorDBClient;