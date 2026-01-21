import DocumentModel from '../models/Document';
import { transcriptService } from './transcriptService';
import { getVectorDBClient } from '../vectordb/client';

// Standard Document Type
export interface Document {
    id: string;
    url: string;
    transcript: string;
    metadata?: any;
}

/**
 * Chunk transcript into smaller pieces for embedding
 */
function chunkTranscript(transcript: string, maxChunkSize: number = 1200): { text: string; index: number }[] {
    const chunks: { text: string; index: number }[] = [];

    // Split by sentences first
    const sentences = transcript.match(/[^.!?]+[.!?]+/g) || [transcript];

    let currentChunk = '';
    let chunkIndex = 0;

    for (const sentence of sentences) {
        if ((currentChunk + sentence).length > maxChunkSize && currentChunk.length > 0) {
            // Save current chunk and start new one
            chunks.push({ text: currentChunk.trim(), index: chunkIndex++ });
            currentChunk = sentence;
        } else {
            currentChunk += ' ' + sentence;
        }
    }

    // Add final chunk
    if (currentChunk.trim().length > 0) {
        chunks.push({ text: currentChunk.trim(), index: chunkIndex });
    }

    const avgSize = chunks.length > 0 ? Math.round(transcript.length / chunks.length) : 0;
    console.log(`[CHUNKING] Created ${chunks.length} chunks (avg size: ${avgSize} chars, max: ${maxChunkSize})`);

    return chunks;
}

/**
 * Handles high-level document operations.
 * Coordinates between transcription and vector indexing.
 */
class DocumentService {
    async uploadDocument(url: string): Promise<Document> {
        try {
            console.log(`[DOCUMENT_SERVICE] Starting upload for: ${url}`);
            console.log(`[DOCUMENT_SERVICE] Fetching transcript and metadata in parallel...`);

            // Fetch both transcript and metadata
            const [transcript, metadata] = await Promise.all([
                transcriptService.extractTranscript(url),
                transcriptService.getVideoMetadata(url)
            ]);

            console.log(`[DOCUMENT_SERVICE] ✓ Both transcript and metadata received`);
            console.log(`[DOCUMENT_SERVICE] Transcript length: ${transcript.length} chars`);
            console.log(`[DOCUMENT_SERVICE] Metadata title: "${metadata.title}"`);
            console.log(`[DOCUMENT_SERVICE] Saving to MongoDB...`);

            // Save to MongoDB
            const savedDoc = await DocumentModel.create({
                url,
                title: metadata.title,
                thumbnail: metadata.thumbnail,
                transcript
            });

            console.log(`[STORAGE] ✓ Document ${savedDoc._id} saved to MongoDB.`);
            console.log(`[STORAGE] ✓ Title: ${metadata.title}`);

            // Generate and store embeddings in vector DB
            console.log(`[DOCUMENT_SERVICE] Chunking transcript for embeddings...`);
            const chunks = chunkTranscript(transcript);
            console.log(`[DOCUMENT_SERVICE] Created ${chunks.length} chunks`);

            const vectorDB = getVectorDBClient();
            await vectorDB.storeVideoEmbeddings(
                savedDoc._id.toString(),
                chunks,
                {
                    title: metadata.title,
                    url: savedDoc.url,
                    thumbnail: metadata.thumbnail
                }
            );

            console.log(`[DOCUMENT_SERVICE] ✓ Upload complete!`);

            return {
                id: savedDoc._id.toString(),
                url: savedDoc.url,
                transcript: savedDoc.transcript
            };
        } catch (error) {
            console.error('[DOCUMENT_SERVICE] ✗ Upload Error:', error);
            throw error;
        }
    }

    /**
     * Performs semantic search using vector database.
     * @param query - The search query
     * @param videoId - Optional video ID to filter search to a specific video
     */
    async searchDocuments(query: string, videoId?: string): Promise<any[]> {
        try {
            console.log(`[SEARCH] Performing vector search for: "${query}"${videoId ? ` (videoId: ${videoId})` : ' (ALL videos)'}`);

            const vectorDB = getVectorDBClient();

            // Perform semantic search using embeddings
            const results = await vectorDB.search(query, videoId, 5);

            console.log(`[SEARCH] ✓ Vector search returned ${results.length} results`);

            return results;
        } catch (error) {
            console.error('[SEARCH] ✗ Vector search error:', error);
            console.log('[SEARCH] Falling back to keyword search...');

            // Fallback to keyword search if vector DB fails
            return this.keywordSearch(query, videoId);
        }
    }

    /**
     * Fallback keyword search (used if vector DB fails)
     */
    private async keywordSearch(query: string, videoId?: string): Promise<any[]> {
        try {
            console.log(`[SEARCH] Using keyword fallback for: "${query}"`);

            const filter = videoId ? { _id: videoId } : {};
            const docs = await DocumentModel.find(filter);

            if (docs.length === 0) {
                return [];
            }

            const results: any[] = [];

            for (const doc of docs) {
                const rawChunks = doc.transcript.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [doc.transcript];

                for (const rawChunk of rawChunks) {
                    const subChunks = rawChunk.match(/.{1,1000}(?:\s|$)/g) || [rawChunk];

                    for (const chunk of subChunks) {
                        if (chunk.toLowerCase().includes(query.toLowerCase())) {
                            results.push({
                                content: chunk.trim(),
                                metadata: { url: doc.url, videoId: doc._id.toString(), title: doc.title, source: 'YouTube Transcript' },
                                score: 0.7
                            });
                        }
                    }
                }
            }

            return results.slice(0, 5);
        } catch (error) {
            console.error('[SEARCH] ✗ Keyword search error:', error);
            return [];
        }
    }

    private generateId(): string {
        return Math.random().toString(36).substr(2, 9);
    }
}

const documentServiceInstance = new DocumentService();

// Exporting named function to match retriever.ts expectations
export const searchDocuments = (query: string, videoId?: string) =>
    documentServiceInstance.searchDocuments(query, videoId);
export default documentServiceInstance;