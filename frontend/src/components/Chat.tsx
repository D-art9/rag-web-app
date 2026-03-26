import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { sendMessage } from '../services/api';

interface ChatProps {
    videoUrl: string;
    videoId: string;
    ytId: string;
    onExportToStudy?: (content: string) => void;
}

interface Message {
    text: string;
    sender: 'user' | 'ai';
    sources?: string[];
}

const Chat: React.FC<ChatProps> = ({ videoId, ytId, onExportToStudy }) => {
    const [messages, setMessages] = useState<Message[]>([
        { text: "### 🔍 ANALYZE_COMPLETED\nSYSTEM_READY_FOR_QUERY", sender: 'ai' }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim() || isTyping) return;
        
        const userMsg = input;
        setInput('');
        setMessages(p => [...p, { text: userMsg, sender: 'user' }]);
        setIsTyping(true);

        try {
            const data = await sendMessage(userMsg, videoId);
            setMessages(p => [...p, { text: data.answer, sender: 'ai', sources: data.sources }]);
        } catch (err: any) {
            setMessages(p => [...p, { text: `### ✗ ERROR\n[ERR_RAG_PIPELINE]: ${err.message}`, sender: 'ai' }]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="bauhaus-chat-layout">
            {/* SOURCE PANEL (YELLOW THEMED) */}
            <aside className="bauhaus-pane source-panel bauhaus-border bauhaus-shadow">
                <div className="pane-headline">01_SOURCE</div>
                
                <div className="pane-content">
                    <div className="thumb-container bauhaus-border">
                        <img 
                            src={`https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`} 
                            alt="YOUTUBE_SOURCE" 
                            style={{ width: '100%', display: 'block' }}
                        />
                        <div className="thumb-overlay">ID: {ytId}</div>
                    </div>
                    
                    <div className="source-meta">
                        <label className="metadata-label">METADATA_STREAM</label>
                        <div className="metadata-box bauhaus-border">
                             <div className="meta-row"><span>ANALYSIS_v1.0.0</span></div>
                             <div className="meta-row"><span>RAG_STATUS: [OK]</span></div>
                        </div>
                    </div>

                    <button className="btn-bauhaus btn-yellow full-width" style={{ marginTop: 'auto' }} onClick={() => onExportToStudy?.(messages.map(m => m.text).join('\n'))}>
                        EXPORT_KNOWLEDGE_BASE
                    </button>
                </div>
            </aside>

            {/* CHAT PANEL (WHITE THEMED) */}
            <main className="bauhaus-pane chat-panel bauhaus-border bauhaus-shadow">
                <div className="pane-headline">02_WORKSPACE</div>

                <div className="chat-flow scroll-bauhaus">
                    {messages.map((msg, i) => (
                        <div key={i} className={`bauhaus-msg ${msg.sender} bauhaus-border`}>
                            <div className={`msg-header ${msg.sender === 'user' ? 'bg-red' : 'bg-blue'}`}>
                                {msg.sender === 'user' ? 'USER_PROMPT' : 'SYSTEM_REPORT'}
                            </div>
                            <div className="msg-body">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown>
                                {msg.sources && msg.sources.length > 0 && (
                                    <div className="msg-citations">
                                      {"// SOURCES: "}{msg.sources.join(', ')}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    {isTyping && <div className="typing-indicator bauhaus-border">ANALYZING_TRANSCRIPTS...</div>}
                    <div ref={messagesEndRef} />
                </div>

                <form onSubmit={handleSend} className="chat-input-area bauhaus-border">
                    <input 
                        type="text" 
                        className="chat-input-field" 
                        placeholder="ASK_STUDY_AI_ANYTHING..." 
                        autoFocus
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                    />
                    <button type="submit" className="btn-bauhaus btn-red chat-send-btn">SEND</button>
                </form>
            </main>

            <style>{`
                .bauhaus-chat-layout {
                    display: grid;
                    grid-template-columns: 350px 1fr;
                    gap: 3rem;
                    height: 100%;
                }

                .bauhaus-pane {
                    display: flex;
                    flex-direction: column;
                    background: white;
                    height: 100%;
                    position: relative;
                }

                .pane-headline {
                    padding: 1rem 1.5rem;
                    background: black;
                    color: white;
                    font-weight: 900;
                    font-size: 1rem;
                    letter-spacing: 0.1em;
                }

                .pane-content { padding: 2rem; flex-grow: 1; display: flex; flex-direction: column; }

                /* THUMBNAIL */
                .thumb-container { position: relative; overflow: hidden; }
                .thumb-overlay {
                    position: absolute; bottom: 0; left: 0; right: 0;
                    background: var(--primary-red); color: white; padding: 0.2rem 1rem;
                    font-weight: 900; font-size: 0.7rem;
                }

                /* META */
                .source-meta { margin-top: 2rem; }
                .metadata-label { display: block; font-weight: 900; font-size: 0.7rem; margin-bottom: 0.5rem; }
                .metadata-box { padding: 1rem; font-weight: 700; font-size: 0.9rem; }
                .meta-row { margin-bottom: 0.5rem; }

                /* CHAT */
                .chat-flow { flex-grow: 1; padding: 2rem; overflow-y: auto; display: flex; flex-direction: column; gap: 2rem; }
                
                .bauhaus-msg { background: white; max-width: 90%; align-self: flex-start; }
                .bauhaus-msg.user { align-self: flex-end; border-color: var(--primary-red); }
                .bauhaus-msg.ai { border-color: var(--primary-blue); }

                .msg-header { padding: 0.3rem 1rem; color: white; font-weight: 900; font-size: 0.7rem; letter-spacing: 0.1em; }
                .bg-red { background: var(--primary-red); }
                .bg-blue { background: var(--primary-blue); }
                
                .msg-body { padding: 1.5rem; font-weight: 500; font-size: 1.1rem; }
                .msg-citations { 
                   margin-top: 1rem; border-top: 2px dashed black; padding-top: 0.5rem;
                   font-size: 0.7rem; color: #666; font-weight: 900;
                }

                .typing-indicator { padding: 1rem; background: #eee; font-weight: 900; width: fit-content; margin: 0 auto; }

                /* INPUT */
                .chat-input-area { margin: 2rem; display: flex; transform: translateY(-1rem); }
                .chat-input-field { flex-grow: 1; border: none; padding: 1.5rem; font-weight: 900; font-family: inherit; outline: none; }
                .chat-send-btn { border-top: none; border-bottom: none; border-right: none; }

                .full-width { width: 100%; }

                @media (max-width: 1000px) {
                  .bauhaus-chat-layout { grid-template-columns: 1fr; }
                  .source-panel { display: none; }
                }
            `}</style>
        </div>
    );
};

export default Chat;