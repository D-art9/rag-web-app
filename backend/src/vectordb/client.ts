import { embeddingService } from '../services/embeddingService';
import fs from 'fs';
import path from 'path';

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
 * Simple File-Based Vector Database
 * Uses @xenova/transformers for embeddings and cosine similarity for search
 */
export class VectorDBClient {
    private embeddingModel: any = null;
    private loadingPromise: Promise<any> | null = null;
    private vectors: VectorEntry[] = [];
    private readonly storePath: string;
    private isReady: boolean = false;

    constructor() {
        this.storePath = path.resolve(__dirname, '../../vector_store.json');
        // FIX: Do NOT load synchronously in constructor — moved to connect()
    }

    /**
     * FIX: Load vectors asynchronously during connect() — no longer blocks startup.
     */
    async connect(): Promise<void> {
        await this.loadVectors();
        this.isReady = true;
        console.log(`[VECTORDB] ✓ File-based vector store ready (${this.vectors.length} vectors loaded)`);
    }

    /**
     * Async vector load from disk
     */
    private async loadVectors(): Promise<void> {
        try {
            if (fs.existsSync(this.storePath)) {
                const data = await fs.promises.readFile(this.storePath, 'utf-8');
                this.vectors = JSON.parse(data);
                console.log(`[VECTORDB] Loaded ${this.vectors.length} vectors from disk`);
            }
        } catch (error) {
            console.error('[VECTORDB] Error loading vectors from disk:', error);
            this.vectors = [];
        }
    }

    /**
     * Save vectors to disk (sync write kept for simplicity during mutation)
     */
    private saveVectors(): void {
        try {
            fs.writeFileSync(this.storePath, JSON.stringify(this.vectors, null, 2));
        } catch (error) {
            console.error('[VECTORDB] Error saving vectors:', error);
        }
    }

    /**
     * Generate embeddings for text via Gemini API
     */
    async generateEmbedding(text: string): Promise<number[]> {
        return await embeddingService.embedText(text);
    }

    /**
     * FIX: Cosine similarity with zero-vector guard to prevent NaN results
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

        // FIX: Guard against division by zero (zero-vector embeddings)
        if (normA === 0 || normB === 0) return 0;

        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }

    /**
     * Store embeddings for a video using HIGH-SPEED BATCHING.
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

            embeddings.forEach((embedding, i) => {
                const chunk = chunks[i];
                this.vectors.push({
                    id: `${videoId}_chunk_${chunk.index}`,
                    videoId,
                    chunkIndex: chunk.index,
                    text: chunk.text,
                    embedding,
                    metadata
                });
            });

            this.saveVectors();
            console.log(`[VECTORDB] ✓ [TURBO_SYNC_COMPLETE] Stored ${chunks.length} embeddings for: "${metadata.title}"`);

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

        let candidates = this.vectors;
        if (videoId) {
            candidates = this.vectors.filter(v => v.videoId === videoId);
        }

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
        this.vectors = this.vectors.filter(v => v.videoId !== videoId);
        this.saveVectors();
        console.log(`[VECTORDB] ✓ Deleted embeddings for videoId: ${videoId}`);
    }

    /**
     * Clear all vectors
     */
    async clearAll(): Promise<void> {
        console.log('[VECTORDB] Clearing all embeddings...');
        this.vectors = [];
        this.saveVectors();
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