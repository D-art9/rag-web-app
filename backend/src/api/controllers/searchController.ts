import { Request, Response } from 'express';
import { searchDocuments } from '../../services/documentService';

export const searchController = {
    // FIX: Actually delegates to the real vector search instead of returning empty []
    handleSearch: async (req: Request, res: Response) => {
        try {
            const query = (req.body.query || req.query.query) as string | undefined;

            if (!query) {
                return res.status(400).json({ error: 'Search query is required' });
            }

            const results = await searchDocuments(query);

            res.status(200).json({ results, query });
        } catch (error: any) {
            console.error('Search Controller Error:', error);
            res.status(500).json({
                message: 'Error searching documents',
                error: error.message
            });
        }
    }
};