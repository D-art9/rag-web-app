import { pipeline } from '@xenova/transformers';
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
     * Initialize the embedding model (Singleton with Race Condition Fix)
     */
    private async initEmbeddingModel(): Promise<any> {
        if (this.embeddingModel) return this.embeddingModel;
        if (this.loadingPromise) return this.loadingPromise;

        console.log('[VECTORDB] Loading embedding model (all-MiniLM-L6-v2)...');
        this.loadingPromise = (async () => {
            try {
                const model = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
                this.embeddingModel = model;
                console.log('[VECTORDB] ✓ Embedding model loaded');
                return model;
            } catch (error) {
                console.error('[VECTORDB] Failed to load embedding model:', error);
                this.loadingPromise = null;
                throw error;
            }
        })();

        return this.loadingPromise;
    }

    /**
     * Generate embeddings for text
     */
    async generateEmbedding(text: string): Promise<number[]> {
        const model = await this.initEmbeddingModel();
        const output = await model(text, { pooling: 'mean', normalize: true }) as any;
        return Array.from(output.data);
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
     * Store embeddings for a video, tracking failures clearly
     */
    async storeVideoEmbeddings(
        videoId: string,
        chunks: { text: string; index: number }[],
        metadata: { title: string; url: string; thumbnail: string }
    ): Promise<void> {
        console.log(`[VECTORDB] Generating embeddings for ${chunks.length} chunks (videoId: ${videoId})...`);

        const BATCH_SIZE = 8;
        let successCount = 0;
        let failedCount = 0;

        for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
            const batch = chunks.slice(i, i + BATCH_SIZE);
            const batchNum = Math.floor(i / BATCH_SIZE) + 1;
            const totalBatches = Math.ceil(chunks.length / BATCH_SIZE);

            console.log(`[VECTORDB] Processing batch ${batchNum}/${totalBatches}`);

            await Promise.all(batch.map(async (chunk) => {
                try {
                    const embedding = await this.generateEmbedding(chunk.text);
                    this.vectors.push({
                        id: `${videoId}_chunk_${chunk.index}`,
                        videoId,
                        chunkIndex: chunk.index,
                        text: chunk.text,
                        embedding,
                        metadata
                    });
                    successCount++;
                } catch (err) {
                    // FIX: Count failures so caller is aware of partial success
                    failedCount++;
                    console.error(`[VECTORDB] Failed to embed chunk ${chunk.index}:`, err);
                }
            }));
        }

        // FIX: Only save if at least some chunks succeeded; warn on partial failure
        if (successCount > 0) {
            this.saveVectors();
            console.log(`[VECTORDB] ✓ Stored ${successCount}/${chunks.length} embeddings for video: "${metadata.title}"`);
        }

        if (failedCount > 0) {
            console.warn(`[VECTORDB] ⚠️ ${failedCount}/${chunks.length} chunks failed to embed. Search quality may be reduced.`);
        }

        if (successCount === 0) {
            throw new Error(`[VECTORDB] All ${chunks.length} chunks failed to embed. Vector store NOT saved.`);
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