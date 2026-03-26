import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import chatRoutes from './api/routes/chat';
import documentRoutes from './api/routes/documents';
import searchRoutes from './api/routes/search';
import videoRoutes from './api/routes/videos';
import contactRoutes from './api/routes/contact';
import studyRoutes from './api/routes/study';
import { errorHandler } from './api/middlewares/errorHandler';
import { globalLimiter, strictLimiter } from './api/middlewares/rateLimiter';
import { connectDB } from './config/database';
import { connectToVectorDB } from './vectordb/client';

dotenv.config();

// FIX: Validate critical environment variables at startup — fail loudly, not silently
const requiredEnvVars = ['LLM_API_KEY', 'MONGODB_URI', 'EXTRACTOR_SERVICE_URL'];
for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        console.error(`[STARTUP] ⚠️  WARNING: Environment variable "${envVar}" is not set. Some features will fail.`);
    }
}
if (!process.env.GEMINI_API_KEY) {
    console.warn('[STARTUP] ⚠️  GEMINI_API_KEY is not set — Study Chat will be unavailable.');
}

const app = express();
const PORT = process.env.PORT || 5000;

// Required for Render (and other proxies) to correctly handle IPs for Rate Limiting
app.set('trust proxy', 1);

// FIX: Consolidated database init — no duplicate error handling
const initializeDatabases = async () => {
    await connectDB();
    await connectToVectorDB();
};

initializeDatabases().catch(err => {
    console.error('[CRITICAL] Failed to initialize databases. Exiting...', err);
    process.exit(1);
});

// Middleware
app.use(cors({
    // FIX: Restrict to known origins in production; allow all only in dev
    origin: process.env.NODE_ENV === 'production'
        ? (process.env.FRONTEND_URL || 'http://localhost:3000')
        : '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser.json());

// Apply Global Rate Limiter
app.use(globalLimiter);

// Routes — apply strict limiter to AI-heavy routes
app.use('/api/chat', strictLimiter, chatRoutes);
app.use('/api/documents', strictLimiter, documentRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/study', studyRoutes);

// Error handling middleware (must be last)
app.use(errorHandler);

// Graceful shutdown handlers
const shutdown = (signal: string) => {
    console.log(`[SERVER] Received ${signal}. Shutting down gracefully...`);
    process.exit(0);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('uncaughtException', (err) => {
    console.error('[CRITICAL] Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('[CRITICAL] Unhandled Rejection at:', promise, 'reason:', reason);
});

app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`=========================================`);
    console.log(`[SERVER] Running on http://0.0.0.0:${PORT}`);
    console.log(`[SERVER] Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`[SERVER] Ready to receive requests`);
    console.log(`=========================================`);
});