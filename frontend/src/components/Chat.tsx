import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Maximize2, Minimize2 } from 'lucide-react';

interface ChatProps {
    videoUrl: string;
    videoId: string;
    ytId: string;
}

interface Message {
    text: string;
    sender: 'user' | 'ai';
    sources?: string[];
}

const Chat: React.FC<ChatProps> = ({ videoId, ytId }) => {
    const [messages, setMessages] = useState<Message[]>([
        { text: "### 🔍 ANALYZE_COMPLETED\nSYSTEM_READY_FOR_QUERY", sender: 'ai' }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // SCROLL_LOCK_LOGIC: Use 'auto' instead of 'smooth' to prevent layout stutter during high-speed streaming.
    useEffect(() => {
        if (messagesEndRef.current) {
            const container = messagesEndRef.current.parentElement;
            if (container) {
                container.scrollTop = container.scrollHeight;
            }
        }
    }, [messages]);

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim() || isTyping) return;
        
        const userMsg = input;
        setInput('');
        setMessages(p => [...p, { text: userMsg, sender: 'user' }]);
        setIsTyping(true);

        const placeholderAiMsg: Message = { text: '', sender: 'ai' };
        setMessages(p => [...p, placeholderAiMsg]);

        try {
            const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://scriptyt-test-laptop.loca.lt/api';
            const response = await fetch(`${API_BASE_URL}/chat/stream`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMsg, videoId }),
            });

            if (!response.ok || !response.body) throw new Error('STREAM_FAILURE: Connection rejected');

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let accumulatedText = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const dataStr = line.replace('data: ', '');
                        try {
                            const data = JSON.parse(dataStr);
                            
                            // To fix no-loop-func, we update the local accumulated text 
                            // and then use a functional state update that only touches state
                            if (data.text) {
                                accumulatedText += data.text;
                                const freshText = accumulatedText; // Safe reference
                                setMessages(prev => {
                                    const next = [...prev];
                                    next[next.length - 1] = { ...next[next.length - 1], text: freshText };
                                    return next;
                                });
                            }

                            if (data.done) {
                                const finalSources = data.sources; // Safe reference
                                setMessages(prev => {
                                    const next = [...prev];
                                    next[next.length - 1] = { ...next[next.length - 1], sources: finalSources };
                                    return next;
                                });
                            }

                            if (data.error) throw new Error(data.error);
                        } catch (e) {
                            console.warn('[STREAM_JSON_PARTIAL]', e);
                        }
                    }
                }
            }
        } catch (err: any) {
            setMessages(p => {
                const next = [...p];
                next[next.length - 1] = { ...next[next.length - 1], text: `### ✗ ERROR\n[ERR_RAG_PIPELINE]: ${err.message}` };
                return next;
            });
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className={`layout-root ${isExpanded ? 'expanded' : ''}`}>
            {/* 01_SOURCE_ENGINE: Vision & Metadata */}
            {!isExpanded && (
                <aside className="sidebar">
                    <div className="industrial-label">01_SOURCE_FEED</div>
                    
                    <div className="glass-card" style={{ padding: '4px', overflow: 'hidden' }}>
                        <img 
                            src={`https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`} 
                            alt="SOURCE" 
                            style={{ width: '100%', borderRadius: '4px', display: 'block' }}
                        />
                    </div>
                    
                    <div className="glass-card" style={{ marginTop: 'var(--grid-gap)' }}>
                        <div className="industrial-label" style={{ marginBottom: '8px' }}>METADATA_STREAM</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '2' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>MODEL_ID</span>
                                <span style={{ color: 'var(--accent-cyan)' }}>G_2.5_CORE</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>RAG_STATUS</span>
                                <span style={{ color: 'var(--accent-blue)' }}>ONLINE</span>
                            </div>
                        </div>
                    </div>

                    <div style={{ marginTop: 'auto', padding: '12px' }}>
                        <div className="industrial-label" style={{ background: 'rgba(255,255,255,0.03)', padding: '8px' }}>
                            <span style={{ color: 'var(--accent-red)' }}>●</span> ENCRYPTED_SYNC
                        </div>
                    </div>
                </aside>
            )}

            {/* 02_WORKSPACE_PANEL: Flow Engine */}
            <main className="workspace-container">
                <header className="workspace-header">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                        <div className="industrial-label" style={{ margin: 0 }}>
                            {isExpanded ? 'CORE_WORKSPACE_EXPANDED' : '02_WORKSPACE_MODE'}
                        </div>
                        <button className="expand-toggle-btn" onClick={() => setIsExpanded(!isExpanded)} style={{ border: 'none', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', padding: '8px', color: 'white' }}>
                            {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                        </button>
                    </div>
                </header>

                <div className="scroll-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'flex-start' }}>
                    {messages.map((msg, i) => (
                        <div key={i} className={`glass-card message-chunk ${msg.sender === 'user' ? 'user-align' : ''}`} style={{ 
                            alignSelf: 'stretch',
                            maxWidth: '900px',
                            borderLeft: `4px solid ${msg.sender === 'user' ? 'var(--accent-red)' : 'var(--accent-blue)'}`,
                            margin: msg.sender === 'user' ? '0 0 0 auto' : '0 auto 0 0'
                        }}>
                            <div className="industrial-label" style={{ color: msg.sender === 'user' ? 'var(--accent-red)' : 'var(--accent-blue)' }}>
                                {msg.sender === 'user' ? 'USER_PROMPT' : 'SYSTEM_REPORT'}
                            </div>
                            <div style={{ color: 'var(--text-main)', fontSize: '15px' }}>
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown>
                                {msg.sources && msg.sources.length > 0 && (
                                    <div style={{ 
                                        marginTop: '16px', borderTop: '1px solid var(--border-light)', 
                                        paddingTop: '8px', fontSize: '11px', color: 'var(--text-muted)' 
                                    }}>
                                      {"// SOURCES: "}{msg.sources.join(', ')}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    {isTyping && (
                        <div className="industrial-label" style={{ alignSelf: 'center', background: 'rgba(255,255,255,0.05)', padding: '10px 20px', borderRadius: '20px' }}>
                             <span className="pulse-dot">●</span> ANALYZING_NEURAL_STREAMS...
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <div style={{ padding: 'var(--grid-gap)', borderTop: 'var(--glass-border)', background: 'var(--bg-header)' }}>
                    <form onSubmit={handleSend} style={{ display: 'flex', gap: '12px', background: 'rgba(255,255,255,0.03)', padding: '8px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                        <input 
                            type="text" 
                            style={{ 
                                flex: 1, background: 'transparent', border: 'none', color: 'white', 
                                padding: '12px', outline: 'none', fontStyle: 'italic'
                            }} 
                            placeholder="INITIALIZE_QUERY_SEQUENCE..." 
                            autoFocus
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                        />
                        <button type="submit" style={{ 
                            background: 'var(--accent-red)', color: 'white', border: 'none', 
                            padding: '0 24px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer'
                        }}>SEND</button>
                    </form>
                </div>

                <style>{`
                    .pulse-dot {
                        color: var(--accent-cyan);
                        animation: pulse 1.5s infinite;
                        margin-right: 12px;
                    }
                    @keyframes pulse {
                        0% { opacity: 0.2; }
                        50% { opacity: 1; }
                        100% { opacity: 0.2; }
                    }
                    .user-align {
                        background: rgba(255, 62, 62, 0.05) !important;
                    }
                `}</style>
            </main>
        </div>
    );
};

export default Chat;