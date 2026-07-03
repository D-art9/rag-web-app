import express from 'express';
import { uploadDocument, getDocuments, getDocument, deleteDocument, getDocumentNews } from '../controllers/documentController';

import progressRouter from './progress';

const router = express.Router();

// SSE progress stream for background upload task
router.use('/progress', progressRouter);

// Upload a YouTube video URL for analysis
router.post('/upload', uploadDocument);

// Get all analyzed documents
router.get('/', getDocuments);

// FIX: Mount previously dead-code routes
router.get('/:id', getDocument);
router.get('/:id/news', getDocumentNews);
router.delete('/:id', deleteDocument);

export default router;