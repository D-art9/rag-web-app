import express from 'express';
import { uploadDocument, getDocuments } from '../controllers/documentController';

const router = express.Router();

// Route to upload a document
router.post('/upload', uploadDocument);

// Route to get all documents
router.get('/', getDocuments);

export default router;