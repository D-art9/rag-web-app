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
        <div className={`bauhaus-chat-layout ${isExpanded ? 'expanded' : ''}`}>
            {/* SOURCE PANEL (VISIBLE ONLY WHEN NOT EXPANDED) */}
            {!isExpanded && (
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

                        <div className="source-footer" style={{ marginTop: 'auto', textAlign: 'center' }}>
                            <div className="tag-bauhaus bauhaus-border">SYSTEM_VERIFIED</div>
                        </div>
                    </div>
                </aside>
            )}

            {/* CHAT PANEL (ADAPTIVE) */}
            <main className="bauhaus-pane chat-panel bauhaus-border bauhaus-shadow">
                <div className="pane-headline">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                        <span>{isExpanded ? 'FULL_WORKSPACE_MODE' : '02_WORKSPACE'}</span>
                        <button className="expand-toggle-btn" onClick={() => setIsExpanded(!isExpanded)}>
                            {isExpanded ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                        </button>
                    </div>
                </div>

                <div className="chat-flow scroll-bauhaus">
                    {/* FLOATING THUMBNAIL IN EXPANDED MODE */}
                    {isExpanded && (
                        <div className="floating-source-tag bauhaus-border bauhaus-shadow-sm">
                            <img src={`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`} alt="SOURCE_THUMB" />
                            <div className="tag-meta">SOURCE_ID: {ytId.substring(0, 4)}...</div>
                        </div>
                    )}

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
                        placeholder="ASK_AI_ANYTHING..." 
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
                    transition: all 0.4s ease-out;
                }

                .bauhaus-chat-layout.expanded {
                    grid-template-columns: 1fr;
                    padding: 0 4rem;
                }

                .bauhaus-pane {
                    display: flex;
                    flex-direction: column;
                    background: var(--pane-bg);
                    height: 100%;
                    position: relative;
                    transition: all 0.4s ease;
                }

                .pane-headline {
                    padding: 1rem 1.5rem;
                    background: var(--border-color);
                    color: var(--pane-bg);
                    font-weight: 900;
                    font-size: 1rem;
                    letter-spacing: 0.1em;
                    display: flex;
                }

                .expand-toggle-btn {
                    background: none;
                    border: 2px solid var(--pane-bg);
                    color: var(--pane-bg);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 4px;
                    transition: all 0.2s;
                }
                .expand-toggle-btn:hover { background: var(--pane-bg); color: var(--border-color); }

                .pane-content { padding: 2rem; flex-grow: 1; display: flex; flex-direction: column; }

                /* FLOATING THUMB */
                .floating-source-tag {
                    position: sticky; top: 0; margin-bottom: 2rem; width: 140px;
                    background: var(--pane-bg); z-index: 10; overflow: hidden;
                }
                .floating-source-tag img { width: 100%; display: block; filter: grayscale(100%); }
                .tag-meta { background: var(--border-color); color: var(--pane-bg); font-size: 0.6rem; padding: 4px; font-weight: 900; }

                /* CHAT */
                .chat-flow { flex-grow: 1; padding: 2rem; overflow-y: auto; display: flex; flex-direction: column; gap: 2rem; }
                
                .bauhaus-msg { background: var(--pane-bg); color: var(--foreground); max-width: 90%; align-self: flex-start; }
                .bauhaus-msg.user { align-self: flex-end; border-color: var(--primary-red); }
                .bauhaus-msg.ai { border-color: var(--primary-blue); }

                .msg-header { padding: 0.3rem 1rem; color: white; font-weight: 900; font-size: 0.7rem; letter-spacing: 0.1em; }
                .bg-red { background: var(--primary-red); }
                .bg-blue { background: var(--primary-blue); }
                
                .msg-body { padding: 1.5rem; font-weight: 500; font-size: 1.1rem; }
                .msg-citations { 
                   margin-top: 1rem; border-top: 2px dashed var(--border-color); padding-top: 0.5rem;
                   font-size: 0.7rem; color: var(--foreground); opacity: 0.6; font-weight: 900;
                }

                .tag-bauhaus { padding: 1rem; font-weight: 900; font-size: 0.8rem; background: rgba(128,128,128,0.1); }

                .typing-indicator { padding: 1rem; background: rgba(128,128,128,0.1); font-weight: 900; width: fit-content; margin: 0 auto; }

                /* INPUT AREA */
                .chat-input-area { margin: 1rem 2rem 2rem; display: flex; background: var(--pane-bg); }
                .chat-input-field { flex-grow: 1; border: none; padding: 1.5rem; font-weight: 900; font-family: inherit; outline: none; background: transparent; color: var(--foreground); }
                .chat-send-btn { border-top: none; border-bottom: none; border-right: none; }

                @media (max-width: 1000px) {
                  .bauhaus-chat-layout { grid-template-columns: 1fr !important; }
                  .source-panel { display: none; }
                  .floating-source-tag { display: block; }
                }
            `}</style>
        </div>
    );
};

export default Chat;