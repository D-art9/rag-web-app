import { Router } from 'express';
import { videoController } from '../controllers/videoController';

const router = Router();

// GET /api/videos - Fetch all videos for history
router.get('/', videoController.getAllVideos);
router.delete('/all', videoController.deleteAllVideos);

export default router;
