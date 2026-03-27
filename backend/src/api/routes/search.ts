import express from 'express';
import { getVectorDBClient } from '../../vectordb/client';
import { generator } from '../../rag/generator';

const router = express.Router();

/**
 * GET /api/search
 * Performs a global semantic search across all indexed videos.
 */
router.get('/', async (req, res) => {
    const { q } = req.query;

    if (!q || typeof q !== 'string') {
        return res.status(400).json({ error: 'Search query "q" is required.' });
    }

    try {
        console.log(`[GLOBAL_SEARCH] 🛰️  SEARCH_INITIATED: "${q}"`);
        const vectorDB = getVectorDBClient();
        
        // 1. Perform vector search across the ENTIRE index (no filter)
        const results = await vectorDB.search(q, { k: 12 });

        console.log(`[GLOBAL_SEARCH] ✓ FOUND_${results.length}_MATCHES`);

        // 2. Return the raw chunks and their metadata for the UI
        return res.json({
            query: q,
            count: results.length,
            results: results.map(r => ({
                text: r.content,
                score: r.score,
                videoId: r.metadata?.documentId || 'Unknown',
                title: r.metadata?.title || 'Unknown Video',
                thumbnail: r.metadata?.thumbnail || '',
                url: r.metadata?.url || '#'
            }))
        });

    } catch (error: any) {
        console.error('[GLOBAL_SEARCH] ✗ ERROR:', error.message);
        res.status(500).json({ error: 'Search failed internally.' });
    }
});

export default router;