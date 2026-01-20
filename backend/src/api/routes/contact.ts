import express from 'express';
import axios from 'axios';

const router = express.Router();

router.post('/', async (req, res) => {
    const { name, message } = req.body;

    if (!message) {
        return res.status(400).json({ error: 'Message is required' });
    }

    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!token || !chatId) {
        console.error('Telegram credentials not configured');
        return res.status(500).json({ error: 'Server configuration error' });
    }

    const text = `
📩 *New Contact Message*
👤 *From:* ${name || 'Anonymous'}
📝 *Message:*
${message}
    `;

    try {
        await axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
            chat_id: chatId,
            text: text,
            parse_mode: 'Markdown'
        });

        res.status(200).json({ success: true, message: 'Message sent to Telegram' });
    } catch (error: any) {
        console.error('Telegram API Error:', error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to send message' });
    }
});

export default router;
