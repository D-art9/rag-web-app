import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

/**
 * Fetches the conversation history for a specific session.
 */
export const fetchChatHistory = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/chat/history`);
        return response.data;
    } catch (error) {
        const err: any = error;
        console.error('Error fetching chat history:', err.response?.data || err.message);
        throw error;
    }
};

/**
 * Uploads a YouTube URL for transcript extraction and indexing.
 * @param url The YouTube video URL
 */
export const uploadDocument = async (url: string) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/documents/upload`, { url });
        return response.data; // Expected: { id, url, transcript }
    } catch (error) {
        const err: any = error;
        console.error('Error uploading document:', err.response?.data || err.message);
        throw error;
    }
};

/**
 * Sends a message to the RAG pipeline.
 * @param message The user's question
 * @param videoId The ID of the analyzed video (for context filtering)
 */
export const sendMessage = async (message: string, videoId?: string) => {
    try {
        // Current backend expects { message } for ragPipeline.process
        const response = await axios.post(`${API_BASE_URL}/chat/send`, {
            message,
            videoId
        });
        return response.data; // Expected: { answer, sources }
    } catch (error) {
        const err: any = error;
        console.error('Error sending message:', err.response?.data || err.message);
        throw error;
    }
};

/**
 * Performs a semantic search (legacy/auxiliary).
 */
export const searchDocuments = async (query: string) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/search/search`, { query });
        return response.data;
    } catch (error) {
        const err: any = error;
        console.error('Error searching documents:', err.response?.data || err.message);
        throw error;
    }
};

/**
 * Fetches the list of analyzed videos history.
 */
export const fetchVideoHistory = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/videos`);
        return response.data.videos; // Returns array of video objects
    } catch (error) {
        const err: any = error;
        console.error('Error fetching video history:', err.response?.data || err.message);
        throw error;
    }
};