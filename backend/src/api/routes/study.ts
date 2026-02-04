import express from 'express';
import { studyController } from '../controllers/studyController';

const router = express.Router();

router.post('/outline', studyController.generateOutline);
router.post('/chat', studyController.chat);

export default router;
