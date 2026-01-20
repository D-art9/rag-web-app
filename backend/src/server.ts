import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import chatRoutes from './api/routes/chat';
import documentRoutes from './api/routes/documents';
import searchRoutes from './api/routes/search';
import videoRoutes from './api/routes/videos';
import contactRoutes from './api/routes/contact';
import { errorHandler } from './api/middlewares/errorHandler';
import { globalLimiter, strictLimiter } from './api/middlewares/rateLimiter';
import { connectDB } from './config/database';
import { connectToVectorDB } from './vectordb/client';

dotenv.config();
// Trigger restart for env update (chat id)

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to Databases
const initializeDatabases = async () => {
    await connectDB();
    await connectToVectorDB();
};

initializeDatabases().catch(err => {
    console.error('Failed to initialize databases:', err);
    process.exit(1);
});

// Middleware
app.use(cors({
    origin: '*', // Allow all origins for dev simplicity, or specify ['http://localhost:3000', 'http://localhost:3001']
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser.json());

// Apply Global Rate Limiter
app.use(globalLimiter);

// Routes
// Apply Strict Limiter to expensive routes
app.use('/api/chat', strictLimiter, chatRoutes);
app.use('/api/documents', strictLimiter, documentRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/contact', contactRoutes);

// Error handling middleware
app.use(errorHandler);

// Start the server
app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Server is running on http://0.0.0.0:${PORT}`);
    console.log(`Ready to accept connections from localhost:${PORT}`);
});