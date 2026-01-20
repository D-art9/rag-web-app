import { Request, Response } from 'express';

export const searchController = {
    /**
     * Handles semantic search across documents.
     * Updated to prefer req.body for POST requests.
     */
    handleSearch: async (req: Request, res: Response) => {
        try {
            // Prefer req.body for POST, fallback to query for compatibility
            const query = req.body.query || req.query.query;

            if (!query) {
                return res.status(400).json({ error: 'Search query is required' });
            }

            res.status(200).json({ results: [], query });
        } catch (error: any) {
            res.status(500).json({
                message: 'Error searching documents',
                error: error.message
            });
        }
    }
};