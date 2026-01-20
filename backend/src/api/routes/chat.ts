import express from 'express';
import { chatController } from '../controllers/chatController';

const router = express.Router();

router.post('/send', chatController.sendMessage);
router.get('/history', chatController.getChatHistory);

export default router;