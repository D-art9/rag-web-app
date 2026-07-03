import { Response } from 'express';

export interface IngestionTask {
    id: string;
    status: 'queued' | 'processing' | 'completed' | 'failed';
    progress: number;
    message: string;
    error?: string;
    videoId?: string;
    connections: Response[];
}

class TaskService {
    private tasks = new Map<string, IngestionTask>();

    createTask(taskId: string): IngestionTask {
        const task: IngestionTask = {
            id: taskId,
            status: 'queued',
            progress: 0,
            message: 'Queued for processing...',
            connections: []
        };
        this.tasks.set(taskId, task);
        return task;
    }

    getTask(taskId: string): IngestionTask | undefined {
        return this.tasks.get(taskId);
    }

    updateTask(taskId: string, updates: Partial<Omit<IngestionTask, 'id' | 'connections'>>) {
        const task = this.tasks.get(taskId);
        if (!task) return;

        Object.assign(task, updates);
        
        // Push update to all listening SSE connections
        this.broadcastProgress(task);

        // Clean up connections if task is finished
        if (task.status === 'completed' || task.status === 'failed') {
            setTimeout(() => {
                task.connections.forEach(res => {
                    try {
                        res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
                        res.end();
                    } catch (e) {
                        // ignore closed connections
                    }
                });
                task.connections = [];
                // Remove task from memory after 10 minutes to prevent memory leaks
                setTimeout(() => this.tasks.delete(taskId), 10 * 60 * 1000);
            }, 2000);
        }
    }

    addConnection(taskId: string, res: Response) {
        const task = this.tasks.get(taskId);
        if (!task) {
            res.status(404).json({ error: 'Task not found' });
            return;
        }

        task.connections.push(res);

        // Send initial state immediately
        res.write(`data: ${JSON.stringify({ 
            status: task.status, 
            progress: task.progress, 
            message: task.message,
            videoId: task.videoId,
            error: task.error
        })}\n\n`);
    }

    removeConnection(taskId: string, res: Response) {
        const task = this.tasks.get(taskId);
        if (!task) return;
        task.connections = task.connections.filter(c => c !== res);
    }

    private broadcastProgress(task: IngestionTask) {
        const payload = JSON.stringify({
            status: task.status,
            progress: task.progress,
            message: task.message,
            videoId: task.videoId,
            error: task.error
        });

        task.connections.forEach(res => {
            try {
                res.write(`data: ${payload}\n\n`);
            } catch (e) {
                // Connection likely broken
            }
        });
    }
}

export const taskService = new TaskService();
