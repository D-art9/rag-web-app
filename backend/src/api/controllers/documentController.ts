import { Request, Response } from 'express';
import documentService from '../../services/documentService';
import DocumentModel from '../../models/Document';
import { getVectorDBClient } from '../../vectordb/client';
import mongoose from 'mongoose';

import { taskService } from '../../services/taskService';
import crypto from 'crypto';

export const uploadDocument = async (req: Request, res: Response) => {
    try {
        const { url } = req.body;
        if (!url) {
            return res.status(400).json({ message: 'URL is required' });
        }

        console.log(`[CONTROLLER] Received upload request for: ${url}`);
        
        // Generate task ID
        const taskId = crypto.randomBytes(8).toString('hex');
        taskService.createTask(taskId);

        // Run ingestion process asynchronously in background
        documentService.uploadDocument(url, taskId).catch(err => {
            console.error(`[BACKGROUND_INGESTION_FAULT] Task ${taskId}:`, err.message);
        });

        // Respond immediately
        res.status(202).json({ taskId });
    } catch (error: any) {
        console.error('Upload Controller Error:', error);
        const detailedError = error.message || 'Unknown server error';
        res.status(500).json({
            message: detailedError,
            error: detailedError
        });
    }
};

// FIX: Actually queries MongoDB instead of returning a hardcoded empty array
export const getDocuments = async (req: Request, res: Response) => {
    try {
        const documents = await DocumentModel.find({})
            .sort({ createdAt: -1 })
            .select('_id url title thumbnail createdAt');

        res.status(200).json({ documents });
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving documents', error });
    }
};

// FIX: Actually fetches a single document by ID
export const getDocument = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid document ID' });
        }

        const document = await DocumentModel.findById(id);
        if (!document) {
            return res.status(404).json({ message: 'Document not found' });
        }

        res.status(200).json({ document });
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving document', error });
    }
};

// FIX: Actually deletes a document from MongoDB and its vectors
export const deleteDocument = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid document ID' });
        }

        const deleted = await DocumentModel.findByIdAndDelete(id);
        if (!deleted) {
            return res.status(404).json({ message: 'Document not found' });
        }

        // Also remove from vector store
        const vectorDB = getVectorDBClient();
        await vectorDB.deleteVideoEmbeddings(id);

        console.log(`[CONTROLLER] ✓ Document ${id} deleted from MongoDB and vector store`);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Error deleting document', error });
    }
};

export const getDocumentNews = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid document ID' });
        }

        const document = await DocumentModel.findById(id);
        if (!document) {
            return res.status(404).json({ message: 'Document not found' });
        }

        const { newsService } = await import('../../services/newsService');
        const category = document.category || 'general';
        const articles = await newsService.fetchNewsByCategory(category);

        res.status(200).json({ category, articles });
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving news for document', error });
    }
};