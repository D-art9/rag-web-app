import { Request, Response } from 'express';
import DocumentModel from '../../models/Document';
import { getVectorDBClient } from '../../vectordb/client';

export const videoController = {
    /**
     * Get all videos (for history sidebar)
     */
    getAllVideos: async (req: Request, res: Response) => {
        try {
            const videos = await DocumentModel.find({})
                .sort({ createdAt: -1 })
                .limit(50)
                .select('_id url title thumbnail createdAt');

            const formattedVideos = videos.map(video => ({
                id: video._id.toString(),
                url: video.url,
                title: video.title,
                thumbnail: video.thumbnail,
                uploadedAt: video.createdAt
            }));

            res.status(200).json({ videos: formattedVideos });
        } catch (error: any) {
            console.error('Error fetching videos:', error);
            res.status(500).json({ error: 'Failed to fetch videos' });
        }
    },

    /**
     * Delete all videos from MongoDB and vector database
     */
    deleteAllVideos: async (req: Request, res: Response) => {
        try {
            console.log('[VIDEO_CONTROLLER] Clearing all videos...');

            // Clear MongoDB
            const result = await DocumentModel.deleteMany({});
            console.log(`[VIDEO_CONTROLLER] ✓ Deleted ${result.deletedCount} documents from MongoDB`);

            // Clear vector database
            const vectorDB = getVectorDBClient();
            await vectorDB.clearAll();
            console.log('[VIDEO_CONTROLLER] ✓ Vector database cleared');

            res.status(200).json({
                message: 'All videos cleared successfully',
                deletedCount: result.deletedCount
            });
        } catch (error: any) {
            console.error('[VIDEO_CONTROLLER] Error clearing videos:', error);
            res.status(500).json({ error: 'Failed to clear videos' });
        }
    }
};
