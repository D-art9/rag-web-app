import { Router, Request, Response } from 'express';
import { taskService } from '../../services/taskService';

const router = Router();

router.get('/:taskId', (req: Request, res: Response) => {
    const { taskId } = req.params;

    // Headers for Server-Sent Events
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Add client to connection pool
    taskService.addConnection(taskId, res);

    // Keep connection alive
    const keepAlive = setInterval(() => {
        res.write(': keepalive\n\n');
    }, 30000);

    // Clean up when client disconnects
    req.on('close', () => {
        clearInterval(keepAlive);
        taskService.removeConnection(taskId, res);
    });
});

export default router;
