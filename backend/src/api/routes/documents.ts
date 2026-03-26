import express from 'express';
import { uploadDocument, getDocuments, getDocument, deleteDocument } from '../controllers/documentController';

const router = express.Router();

// Upload a YouTube video URL for analysis
router.post('/upload', uploadDocument);

// Get all analyzed documents
router.get('/', getDocuments);

// FIX: Mount previously dead-code routes
router.get('/:id', getDocument);
router.delete('/:id', deleteDocument);

export default router;