import { useState } from 'react';

interface Message {
    text: string;
    sender: 'user' | 'bot';
}

const useChat = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);

    const sendMessage = async () => {
        if (input.trim() === '') return;

        const newMessage: Message = { text: input, sender: 'user' };
        setMessages((prev) => [...prev, newMessage]);
        setInput('');
        setLoading(true);

        // Placeholder for API call to send the message
        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: input }),
            });
            const data = await response.json();
            setMessages((prev) => [...prev, { text: data.reply, sender: 'bot' }]);
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            setLoading(false);
        }
    };

    return {
        messages,
        input,
        setInput,
        sendMessage,
        loading,
    };
};

export default useChat;