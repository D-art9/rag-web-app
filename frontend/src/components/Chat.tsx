import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { sendMessage } from '../services/api';

interface ChatProps {
    videoUrl: string;
    videoId: string;
    onExportToStudy?: (content: string) => void;
}

interface Message {
    text: string;
    sender: 'user' | 'ai';
    sources?: string[];
}

const Chat: React.FC<ChatProps> = ({ videoUrl, videoId, onExportToStudy }) => {
    const [messages, setMessages] = useState<Message[]>([
        { text: "Hello! I've analyzed this video. What would you like to know?", sender: 'ai' }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim() || isTyping) return;

        const userMsg = input;
        setInput('');
        setMessages(prev => [...prev, { text: userMsg, sender: 'user' }]);
        setIsTyping(true);

        try {
            const data = await sendMessage(userMsg, videoId);
            setMessages(prev => [...prev, { 
                text: data.answer, 
                sender: 'ai',
                sources: data.sources 
            }]);
        } catch (err) {
            setMessages(prev => [...prev, { text: "Sorry, I encountered an error responding.", sender: 'ai' }]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="dashboard-grid">
            {/* LEFT COLUMN: VIDEO INSIGHTS */}
            <aside className="insights-panel glass-panel">
                <div className="section-header">
                    <h3>Video Insights</h3>
                </div>
                
                <div className="video-preview glass-card">
                    <img 
                        src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`} 
                        alt="Thumbnail" 
                        className="thumb"
                    />
                    <div className="play-overlay">▶</div>
                </div>

                <div className="insights-content">
                    <div className="insight-badge neon-glow-purple">Key Concepts</div>
                    <ul className="smart-notes">
                        <li>• Real-time translation of core topics</li>
                        <li>• Topic extraction from audio stream</li>
                        <li>• Semantic indexing of key timestamps</li>
                        <li>• Cross-referencing with global knowledge</li>
                    </ul>
                    <button 
                        className="export-btn glass-card"
                        onClick={() => onExportToStudy?.(messages.map(m => m.text).join('\n'))}
                    >
                        📥 Export Study Notes
                    </button>
                </div>
            </aside>

            {/* RIGHT COLUMN: CHAT INTERFACE */}
            <main className="chat-interface glass-panel">
                <div className="section-header">
                    <h3>AI Study Assistant</h3>
                </div>

                <div className="messages-flow">
                    {messages.map((msg, i) => (
                        <div key={i} className={`message-wrapper ${msg.sender}`}>
                            <div className="avatar-small">{msg.sender === 'ai' ? '🧠' : '👤'}</div>
                            <div className={`bubble glass-card ${msg.sender === 'user' ? 'neon-glow-cyan' : 'neon-glow-purple'}`}>
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown>
                                {msg.sources && msg.sources.length > 0 && (
                                    <div className="sources-tag">📚 {msg.sources.length} Sources</div>
                                )}
                            </div>
                        </div>
                    ))}
                    {isTyping && (
                        <div className="message-wrapper ai">
                            <div className="bubble typing-dots">...</div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <form onSubmit={handleSend} className="chat-input-area">
                    <div className="input-box glass-card">
                        <input 
                            type="text" 
                            placeholder="Ask a question about the video..." 
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                        />
                        <button type="submit" className="send-btn">Send 🚀</button>
                    </div>
                </form>
            </main>

            <style>{`
                .dashboard-grid {
                    display: grid;
                    grid-template-columns: 350px 1fr;
                    gap: 1.5rem;
                    height: calc(100vh - 4rem);
                }

                .section-header {
                    margin-bottom: 2rem;
                    padding-bottom: 1rem;
                    border-bottom: 1px solid var(--glass-border);
                }

                .insights-panel, .chat-interface {
                    padding: 2rem;
                    border-radius: var(--radius-lg);
                    display: flex;
                    flex-direction: column;
                }

                .video-preview {
                    width: 100%;
                    aspect-ratio: 16/9;
                    overflow: hidden;
                    position: relative;
                    margin-bottom: 2rem;
                }

                .video-preview .thumb {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .play-overlay {
                    position: absolute;
                    inset: 0;
                    background: rgba(0,0,0,0.4);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 2rem;
                }

                .insight-badge {
                    display: inline-block;
                    padding: 0.4rem 1rem;
                    background: var(--accent-secondary);
                    color: #fff;
                    border-radius: 100px;
                    font-size: 0.75rem;
                    font-weight: 700;
                    margin-bottom: 1.5rem;
                }

                .smart-notes {
                    list-style: none;
                    color: var(--text-secondary);
                    font-size: 0.9rem;
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                    margin-bottom: 2.5rem;
                }

                .export-btn {
                    width: 100%;
                    padding: 1rem;
                    background: rgba(255,255,255,0.05);
                    border: 1px solid var(--glass-border);
                    color: #fff;
                    cursor: pointer;
                    font-weight: 600;
                }

                /* CHAT STYLES */
                .messages-flow {
                    flex-grow: 1;
                    overflow-y: auto;
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                    padding-right: 1rem;
                    margin-bottom: 1.5rem;
                }

                .message-wrapper {
                    display: flex;
                    gap: 1rem;
                    max-width: 80%;
                }

                .message-wrapper.user {
                    flex-direction: row-reverse;
                    align-self: flex-end;
                }

                .bubble {
                    padding: 1rem 1.5rem;
                }

                .user .bubble {
                    background: rgba(0, 247, 255, 0.05);
                    border-color: rgba(0, 247, 255, 0.2);
                }

                .ai .bubble {
                    background: rgba(168, 85, 247, 0.05);
                    border-color: rgba(168, 85, 247, 0.2);
                }

                .input-box {
                    display: flex;
                    padding: 0.5rem;
                    gap: 1rem;
                }

                .input-box input {
                    flex-grow: 1;
                    background: transparent;
                    border: none;
                    color: #fff;
                    padding: 0.8rem;
                    outline: none;
                }

                .send-btn {
                    background: var(--accent-primary);
                    border: none;
                    padding: 0.8rem 1.5rem;
                    border-radius: 12px;
                    font-weight: 700;
                    cursor: pointer;
                }

                .sources-tag {
                    margin-top: 0.5rem;
                    font-size: 0.7rem;
                    color: var(--text-secondary);
                }
            `}</style>
        </div>
    );
};

export default Chat;