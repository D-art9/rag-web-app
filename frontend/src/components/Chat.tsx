import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { sendMessage } from '../services/api';

interface ChatProps {
    videoUrl: string;
    videoId: string; // This is the Document ID for search
    ytId: string;    // This is the actual YouTube ID for thumbnail
    onExportToStudy?: (content: string) => void;
}

interface Message {
    text: string;
    sender: 'user' | 'ai';
    sources?: string[];
}

const Chat: React.FC<ChatProps> = ({ videoId, ytId, onExportToStudy }) => {
    const [messages, setMessages] = useState<Message[]>([
        { text: "ANALYZE_COMPLETED: SYSTEM_READY_FOR_QUERY", sender: 'ai' }
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
            setMessages(p => [...p, { text: `[ERR_RAG_PIPELINE]: ${err.message}`, sender: 'ai' }]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="terminal-dashboard">
            {/* SOURCE INSIGHTS PANE */}
            <aside className="pane insights-pane">
                <div className="pane-header">
                  <span>SOURCE_v1.0.0: /root/insights</span>
                  <span>[-] [+] [X]</span>
                </div>
                
                <div className="pane-content">
                    {ytId ? (
                        <div style={{ position: 'relative', width: '100%', border: '1px solid var(--border-color)', marginBottom: '1rem', background: '#000' }}>
                            <img 
                                src={`https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`} 
                                alt="YOUTUBE_SOURCE" 
                                style={{ width: '100%', display: 'block' }}
                                onError={(e) => {
                                    (e.target as any).src = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
                                }}
                            />
                            <div className="img-overlay">SOURCE_FRAME_LOCKED</div>
                        </div>
                    ) : (
                        <div className="empty-thumb">[NO_SOURCE_FRAME]</div>
                    )}
                    
                    <div className="system-data">
                        <p className="system-label">&gt; VIDEO_ID_STREAM:</p>
                        <p className="system-value mono">{ytId || '0xUNKNOWN'}</p>
                        
                        <p className="system-label">&gt; DOC_ID_CONTEXT:</p>
                        <p className="system-value mono" style={{ fontSize: '0.6rem', color: 'var(--muted-color)' }}>{videoId}</p>
                        
                        <p className="system-label">&gt; SYSTEM_READY:</p>
                        <div className="mini-grid">
                            <span>[ANALYSIS]</span>
                            <span>[SYNC]</span>
                        </div>
                    </div>

                    <div className="system-actions">
                        <button className="term-btn full" onClick={() => onExportToStudy?.(messages.map(m => m.text).join('\n'))}>
                           /run EXPORT_LOG
                        </button>
                    </div>
                </div>
            </aside>

            {/* QUERY SHELL PANE */}
            <main className="pane chat-pane">
                <div className="pane-header">
                  <span>SCRIPTYT: /bin/llm_query_shell</span>
                  <span>[0.12ms]</span>
                </div>

                <div className="shell-flow">
                    {messages.map((msg, i) => (
                        <div key={i} className={`shell-msg ${msg.sender}`}>
                            <span className="msg-prompt">
                                {msg.sender === 'user' ? 'root@shell:~$ ' : 'kernel@rag:~$ '}
                            </span>
                            <div className="msg-content">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown>
                                {msg.sources && msg.sources.length > 0 && (
                                    <div className="msg-sources">
                                      {"// REF_SOURCES: "}{msg.sources.join(', ')}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    {isTyping && <div className="shell-msg ai">kernel@rag:~$ [ANALYZING_TRANSCRIPTS...]</div>}
                    <div ref={messagesEndRef} />
                </div>

                <form onSubmit={handleSend} className="shell-input-area">
                    <div className="input-prompt">
                        <span>root@shell:~$ </span>
                        <input 
                            type="text" 
                            className="term-input" 
                            placeholder="TYPE_QUESTION_HERE..." 
                            autoFocus
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                        />
                        <button type="submit" className="term-btn">SEND_v1.0</button>
                    </div>
                </form>
            </main>

            <style>{`
                .terminal-dashboard { display: grid; grid-template-columns: 320px 1fr; gap: 1rem; height: 100%; border-top: 1px solid var(--border-color); }
                .pane { display: flex; flex-direction: column; height: 100%; }
                .pane-content { padding: 1.5rem; flex-grow: 1; overflow-y: auto; }
                
                .img-overlay { position: absolute; bottom: 0; left: 0; right: 0; background: rgba(0,0,0,0.6); color: var(--primary-color); font-size: 0.6rem; padding: 2px 10px; }

                .system-data { margin-top: 1rem; }
                .system-label { font-size: 0.6rem; color: var(--muted-color); font-weight: bold; }
                .system-value { font-size: 0.8rem; margin: 0.2rem 0 0.8rem 0; }
                
                .mini-grid {
                   display: grid;
                   grid-template-columns: 1fr 1fr;
                   gap: 0.2rem;
                   font-size: 0.6rem;
                }

                .shell-flow { flex-grow: 1; padding: 1.5rem; overflow-y: auto; display: flex; flex-direction: column; gap: 1.2rem; }
                .shell-msg { display: flex; gap: 0.5rem; }
                .msg-prompt { color: var(--secondary-color); font-weight: bold; flex-shrink: 0; }
                .msg-content { font-size: 0.9rem; line-height: 1.4; color: var(--primary-color); }
                .msg-sources { font-size: 0.7rem; color: var(--muted-color); margin-top: 0.5rem; }

                .shell-input-area { padding: 1rem 1.5rem; border-top: 1px dashed var(--border-color); }
                .input-prompt { display: flex; gap: 0.5rem; align-items: center; }
                .term-input { flex-grow: 1; color: var(--primary-color); background: transparent; border: none; outline: none; }

                @media (max-width: 900px) {
                  .terminal-dashboard { grid-template-columns: 1fr; }
                  .insights-pane { display: none; }
                }
            `}</style>
        </div>
    );
};

export default Chat;