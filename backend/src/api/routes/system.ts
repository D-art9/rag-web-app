import { Router } from 'express';
import axios from 'axios';

const router = Router();

router.get('/tunnel-status', async (req, res) => {
    const tunnelUrl = process.env.EXTRACTOR_SERVICE_URL || 'https://scriptyt-node-v2.loca.lt';
    
    try {
        // Attempt to hit the root of the tunnel (or a health endpoint if it exists)
        // localtunnel requires this bypass header
        const response = await axios.get(tunnelUrl, {
            timeout: 5000,
            headers: { 'Bypass-Tunnel-Reminder': 'true' }
        });
        
        // If we get a 200, tunnel is online
        res.json({ status: 'online', url: tunnelUrl });
    } catch (error: any) {
        // If error status is 5xx or network fails, it's offline
        res.json({ status: 'offline', error: error.message });
    }
});

export default router;
