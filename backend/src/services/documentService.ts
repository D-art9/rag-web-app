import DocumentModel from '../models/Document';
import { transcriptService } from './transcriptService';
import { getVectorDBClient } from '../vectordb/client';
import mongoose from 'mongoose';

// Standard Document Type
export interface Document {
    id: string;
    url: string;
    transcript: string;
    metadata?: any;
}

/**
 * Chunk transcript into smaller pieces for embedding.
 * Uses a robust strategy: Sentences -> Words -> Characters to ensure chunks fit within limits.
 */
function chunkTranscript(transcript: string, maxChunkSize: number = 1000): { text: string; index: number }[] {
    const chunks: { text: string; index: number }[] = [];

    // Clean up extra whitespace first
    const cleanText = transcript.replace(/\s+/g, ' ').trim();

    // Safety check for empty text
    if (!cleanText) return [];

    let start = 0;
    while (start < cleanText.length) {
        let end = start + maxChunkSize;

        if (end >= cleanText.length) {
            chunks.push({ text: cleanText.slice(start).trim(), index: chunks.length });
            break;
        }

        let breakPoint = -1;
        const lookBackWindow = Math.min(200, maxChunkSize / 2);
        const chunkSlice = cleanText.slice(end - lookBackWindow, end);

        const sentenceMatch = chunkSlice.lastIndexOf('.');
        if (sentenceMatch !== -1) {
            breakPoint = end - lookBackWindow + sentenceMatch + 1;
        } else {
            breakPoint = cleanText.lastIndexOf(' ', end);
        }

        if (breakPoint <= start) {
            breakPoint = end;
        }

        const chunkText = cleanText.slice(start, breakPoint).trim();
        if (chunkText.length > 0) {
            chunks.push({ text: chunkText, index: chunks.length });
        }

        start = breakPoint;
    }

    const avgSize = chunks.length > 0 ? Math.round(cleanText.length / chunks.length) : 0;
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

            // FIX: Single call to microservice instead of two parallel calls
            const { transcript, title, thumbnail } = await transcriptService.extractAll(url);

            console.log(`[DOCUMENT_SERVICE] ✓ Transcript and metadata received`);
            console.log(`[DOCUMENT_SERVICE] Transcript length: ${transcript.length} chars`);
            console.log(`[DOCUMENT_SERVICE] Metadata title: "${title}"`);
            console.log(`[DOCUMENT_SERVICE] Saving to MongoDB...`);

            // Save to MongoDB
            const savedDoc = await DocumentModel.create({ url, title, thumbnail, transcript });

            console.log(`[STORAGE] ✓ Document ${savedDoc._id} saved to MongoDB.`);

            // Generate and store embeddings in vector DB
            console.log(`[DOCUMENT_SERVICE] Chunking transcript for embeddings...`);
            const chunks = chunkTranscript(transcript);
            console.log(`[DOCUMENT_SERVICE] Created ${chunks.length} chunks`);

            const vectorDB = getVectorDBClient();
            await vectorDB.storeVideoEmbeddings(
                savedDoc._id.toString(),
                chunks,
                { title, url: savedDoc.url, thumbnail }
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

    async searchDocuments(query: string, videoId?: string): Promise<any[]> {
        try {
            console.log(`[SEARCH] Performing vector search for: "${query}"${videoId ? ` (videoId: ${videoId})` : ' (ALL videos)'}`);

            const vectorDB = getVectorDBClient();
            const results = await vectorDB.search(query, videoId, 5);

            console.log(`[SEARCH] ✓ Vector search returned ${results.length} results`);
            return results;
        } catch (error) {
            console.error('[SEARCH] ✗ Vector search error:', error);
            console.log('[SEARCH] Falling back to keyword search...');
            return this.keywordSearch(query, videoId);
        }
    }

    private async keywordSearch(query: string, videoId?: string): Promise<any[]> {
        try {
            console.log(`[SEARCH] Using keyword fallback for: "${query}"`);

            // FIX: Properly convert string to ObjectId for MongoDB _id queries
            let filter: any = {};
            if (videoId) {
                try {
                    filter = { _id: new mongoose.Types.ObjectId(videoId) };
                } catch {
                    console.warn(`[SEARCH] Invalid videoId format: ${videoId}, searching all docs`);
                }
            }

            const docs = await DocumentModel.find(filter);
            if (docs.length === 0) return [];

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
}

const documentServiceInstance = new DocumentService();

export const searchDocuments = (query: string, videoId?: string) =>
    documentServiceInstance.searchDocuments(query, videoId);

export default documentServiceInstance;