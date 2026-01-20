import { useEffect, useRef } from 'react';

const useWebSocket = (url: string) => {
    const socketRef = useRef<WebSocket | null>(null);

    useEffect(() => {
        socketRef.current = new WebSocket(url);

        socketRef.current.onopen = () => {
            console.log('WebSocket connection established');
        };

        socketRef.current.onmessage = (event) => {
            console.log('Message received:', event.data);
        };

        socketRef.current.onclose = () => {
            console.log('WebSocket connection closed');
        };

        return () => {
            socketRef.current?.close();
        };
    }, [url]);

    const sendMessage = (message: string) => {
        if (socketRef.current) {
            socketRef.current.send(message);
        }
    };

    return { sendMessage };
};

export default useWebSocket;