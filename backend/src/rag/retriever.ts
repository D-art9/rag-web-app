import { searchDocuments } from '../services/documentService';

export interface RetrievalResult {
    content: string;
    metadata: any;
    score: number;
}

/**
 * Handles retrieval of relevant context from the vector database.
 * Does NOT interact with LLMs.
 */
export const retriever = {
    retrieve: async (query: string, documentId?: string): Promise<RetrievalResult[]> => {
        try {
            console.log(`[RETRIEVER] Retrieving context for query: "${query}", videoId: ${documentId || 'ALL'}`);

            // Uses existing documentService search with optional videoId filter
            const results = await searchDocuments(query, documentId);

            console.log(`[RETRIEVER] Found ${results.length} matching chunks`);

            // Map to internal RAG format
            return results.map((res: any) => ({
                content: res.content || res.text || '',
                metadata: res.metadata || {},
                score: res.score || 0
            }));
        } catch (error) {
            console.error('RAG Retriever Error:', error);
            throw new Error('Failed to retrieve context');
        }
    }
};