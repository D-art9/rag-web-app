import { Request, Response } from 'express';
import documentService from '../../services/documentService';

export const uploadDocument = async (req: Request, res: Response) => {
    try {
        const { url } = req.body;
        if (!url) {
            return res.status(400).json({ message: 'URL is required' });
        }

        console.log(`[CONTROLLER] Received upload request for: ${url}`);
        const document = await documentService.uploadDocument(url);

        res.status(201).json(document);
    } catch (error: any) {
        console.error('Upload Controller Error:', error);
        const detailedError = error.message || 'Unknown server error';
        const isCaptionError = detailedError.toLowerCase().includes('captions');

        res.status(isCaptionError ? 400 : 500).json({
            message: detailedError,
            error: detailedError
        });
    }
};

export const getDocuments = async (req: Request, res: Response) => {
    try {
        res.status(200).json({ documents: [] });
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving documents', error });
    }
};

export const getDocument = async (req: Request, res: Response) => {
    try {
        res.status(200).json({ id: req.params.id });
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving document', error });
    }
};

export const deleteDocument = async (req: Request, res: Response) => {
    try {
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Error deleting document', error });
    }
};