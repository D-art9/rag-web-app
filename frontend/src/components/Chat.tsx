import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import mermaid from 'mermaid';
import { Maximize2, Minimize2 } from 'lucide-react';

mermaid.initialize({ theme: 'dark', fontFamily: 'monospace' });

const MermaidBlock = ({ chart }: { chart: string }) => {
    const [svg, setSvg] = useState('');
    
    useEffect(() => {
        const renderChart = async () => {
            try {
                const id = `mermaid-${Date.now()}`;
                const result = await mermaid.render(id, chart);
                setSvg(result.svg);
            } catch (e) {
                // Ignore parsing errors during generative token streaming
            }
        };
        if (chart) renderChart();
    }, [chart]);

    return svg ? (
        <div className="mermaid-rendered glass-card" dangerouslySetInnerHTML={{ __html: svg }} 
             style={{ padding: '20px', background: 'rgba(0,0,0,0.5)', margin: '16px 0', border: '1px solid var(--accent-cyan)', textAlign: 'center' }} />
    ) : (
        <pre><code className="language-mermaid">{chart}</code></pre>
    );
};

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
        { text: "System online. Ready to answer questions about this video.", sender: 'ai' }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [newsArticles, setNewsArticles] = useState<any[]>([]);
    const [category, setCategory] = useState<string>('general');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const loadNews = async () => {
            if (!videoId) return;
            try {
                const api = await import('../services/api');
                const data = await api.fetchDocumentNews(videoId);
                setCategory(data.category || 'general');
                setNewsArticles(data.articles || []);
            } catch (err) {
                console.error('Failed to load category news:', err);
            }
        };
        loadNews();
    }, [videoId]);

    useEffect(() => {
        if (messagesEndRef.current) {
            const container = messagesEndRef.current.parentElement;
            if (container) container.scrollTop = container.scrollHeight;
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
                            if (data.text) {
                                accumulatedText += data.text;
                                const freshText = accumulatedText;
                                setMessages(prev => {
                                    const next = [...prev];
                                    next[next.length - 1] = { ...next[next.length - 1], text: freshText };
                                    return next;
                                });
                            }
                            if (data.done) {
                                const finalSources = data.sources;
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
                next[next.length - 1] = { ...next[next.length - 1], text: `**Error:** ${err.message}` };
                return next;
            });
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className={`chat-layout ${isExpanded ? 'expanded' : ''}`}>

            {/* SOURCE FEED SIDEBAR */}
            {!isExpanded && (
                <aside className="video-info-aside">
                    <div className="industrial-label">01_SOURCE_FEED</div>

                    <div className="thumbnail-box">
                        <img
                            src={`https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`}
                            alt="SOURCE"
                        />
                    </div>

                    <div className="glass-card" style={{ marginTop: '24px', padding: '16px' }}>
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

                    {newsArticles.length > 0 && (
                        <div className="glass-card" style={{ marginTop: '24px', padding: '16px', overflowY: 'auto', maxHeight: '300px' }}>
                            <div className="industrial-label" style={{ marginBottom: '12px', color: 'var(--accent-cyan)' }}>LIVE_FEED: {category.toUpperCase()}</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {newsArticles.map((article, index) => (
                                    <a 
                                        key={index} 
                                        href={article.url} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        style={{ 
                                            textDecoration: 'none', 
                                            display: 'flex', 
                                            gap: '10px', 
                                            background: 'rgba(255,255,255,0.02)', 
                                            borderRadius: '6px', 
                                            padding: '8px', 
                                            border: '1px solid rgba(255,255,255,0.05)',
                                            transition: '0.2s',
                                            alignItems: 'center'
                                        }}
                                    >
                                        {article.image && (
                                            <img 
                                                src={article.image} 
                                                alt="" 
                                                style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px', flexShrink: 0 }} 
                                            />
                                        )}
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', overflow: 'hidden' }}>
                                            <span style={{ fontSize: '11px', fontWeight: 900, color: 'white', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: '1.2' }}>
                                                {article.title}
                                            </span>
                                            <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>
                                                {article.source?.name}
                                            </span>
                                        </div>
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}

                    <div style={{ marginTop: 'auto', paddingTop: '20px' }}>
                        <div className="industrial-label" style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', marginBottom: 0 }}>
                            <span style={{ color: 'var(--accent-red)' }}>●</span> ENCRYPTED_SYNC
                        </div>
                    </div>
                </aside>
            )}

            {/* MAIN WORKSPACE */}
            <main className="workspace-container">
                <header className="workspace-header">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-cyan)', display: 'inline-block', boxShadow: '0 0 8px var(--accent-cyan)' }} />
                            <span style={{ fontSize: '11px', fontWeight: 900, letterSpacing: '0.15em', color: 'var(--text-muted)' }}>
                                {isExpanded ? 'CORE_WORKSPACE_EXPANDED' : 'NEURAL_QUERY_ENGINE'}
                            </span>
                        </div>
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            style={{ border: 'none', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', padding: '8px', color: 'white', cursor: 'pointer' }}
                        >
                            {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                        </button>
                    </div>
                </header>

                {/* MESSAGE STREAM */}
                <div className="scroll-panel" style={{ padding: '32px 40px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {messages.map((msg, i) => (
                        msg.sender === 'user' ? (
                            <div key={i} style={{ alignSelf: 'flex-end', maxWidth: '70%', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                                <span style={{ fontSize: '9px', fontWeight: 900, letterSpacing: '0.15em', color: 'var(--accent-red)', opacity: 0.7 }}>YOU</span>
                                <div style={{
                                    background: 'rgba(255,62,62,0.08)',
                                    border: '1px solid rgba(255,62,62,0.25)',
                                    borderRadius: '16px 16px 4px 16px',
                                    padding: '14px 20px',
                                    color: 'var(--text-main)',
                                    fontSize: '15px',
                                    lineHeight: '1.6'
                                }}>
                                    {msg.text}
                                </div>
                            </div>
                        ) : (
                            <div key={i} className="ai-message-card" style={{ alignSelf: 'flex-start', maxWidth: '85%', width: '100%' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-blue)', boxShadow: '0 0 8px var(--accent-blue)' }} />
                                    <span style={{ fontSize: '9px', fontWeight: 900, letterSpacing: '0.2em', color: 'var(--accent-blue)' }}>SCRIPTYT · AI RESPONSE</span>
                                    <div style={{ flex: 1, height: '1px', background: 'var(--border-light)' }} />
                                    <span style={{ fontSize: '9px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>MSG_{String(i).padStart(3, '0')}</span>
                                </div>
                                <div className="glass-card ai-content" style={{ borderLeft: '3px solid var(--accent-blue)', padding: '20px 24px' }}>
                                    <div className="markdown-body" style={{ color: 'var(--text-main)', fontSize: '15px', lineHeight: '1.75' }}>
                                        <ReactMarkdown 
                                            remarkPlugins={[remarkGfm]}
                                            components={{
                                                code({node, inline, className, children, ...props}: any) {
                                                    const match = /language-(\w+)/.exec(className || '');
                                                    if (!inline && match && match[1] === 'mermaid') {
                                                        return <MermaidBlock chart={String(children).replace(/\n$/, '')} />;
                                                    }
                                                    return !inline ? (
                                                        <pre className={className} {...props}>
                                                            <code className={className} {...props}>
                                                                {children}
                                                            </code>
                                                        </pre>
                                                    ) : (
                                                        <code className={className} {...props}>
                                                            {children}
                                                        </code>
                                                    );
                                                }
                                            }}
                                        >
                                            {msg.text}
                                        </ReactMarkdown>
                                    </div>
                                    {msg.sources && msg.sources.length > 0 && (
                                        <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-light)', display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                                            <span style={{ fontSize: '9px', fontWeight: 900, letterSpacing: '0.15em', color: 'var(--text-muted)' }}>SOURCES</span>
                                            {msg.sources.map((src: string, si: number) => (
                                                <span key={si} style={{
                                                    background: 'rgba(0,242,255,0.07)',
                                                    border: '1px solid rgba(0,242,255,0.2)',
                                                    borderRadius: '4px', padding: '3px 10px',
                                                    fontSize: '11px', color: 'var(--accent-cyan)',
                                                    fontFamily: 'monospace'
                                                }}>{src}</span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    ))}

                    {isTyping && (
                        <div style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div className="neural-pulse">
                                <span /><span /><span /><span /><span />
                            </div>
                            <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 900, letterSpacing: '0.15em' }}>GENERATING RESPONSE...</span>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* INPUT BAR */}
                <div style={{ padding: '20px 40px', borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.3)' }}>
                    <form onSubmit={handleSend} style={{ display: 'flex', gap: '12px', background: 'rgba(255,255,255,0.03)', padding: '10px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', alignItems: 'center' }}>
                        <span style={{ fontSize: '14px', color: 'var(--accent-red)', fontWeight: 900, flexShrink: 0 }}>›</span>
                        <input
                            type="text"
                            style={{ flex: 1, background: 'transparent', border: 'none', color: 'white', padding: '10px 4px', outline: 'none', fontSize: '15px' }}
                            placeholder="Ask anything about this video..."
                            autoFocus
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                        />
                        <span style={{ fontSize: '9px', color: 'var(--text-muted)', flexShrink: 0 }}>⏎ SEND</span>
                        <button type="submit" style={{
                            background: 'var(--accent-red)', color: 'white', border: 'none',
                            padding: '10px 20px', borderRadius: '8px', fontWeight: 900, cursor: 'pointer',
                            fontSize: '12px', letterSpacing: '0.1em'
                        }}>SEND</button>
                    </form>
                </div>

                <style>{`
                    .neural-pulse { display: flex; gap: 4px; align-items: flex-end; height: 24px; }
                    .neural-pulse span {
                        width: 4px; background: var(--accent-cyan); border-radius: 2px;
                        animation: neural-bar 1.2s ease-in-out infinite; opacity: 0.7;
                    }
                    .neural-pulse span:nth-child(1) { height: 8px; animation-delay: 0s; }
                    .neural-pulse span:nth-child(2) { height: 16px; animation-delay: 0.15s; }
                    .neural-pulse span:nth-child(3) { height: 24px; animation-delay: 0.3s; }
                    .neural-pulse span:nth-child(4) { height: 16px; animation-delay: 0.45s; }
                    .neural-pulse span:nth-child(5) { height: 8px; animation-delay: 0.6s; }
                    @keyframes neural-bar {
                        0%, 100% { opacity: 0.3; transform: scaleY(0.5); }
                        50% { opacity: 1; transform: scaleY(1); }
                    }
                    .markdown-body h1,.markdown-body h2,.markdown-body h3 { color: white; font-weight: 900; margin: 16px 0 8px; }
                    .markdown-body h1 { font-size: 1.4em; }
                    .markdown-body h2 { font-size: 1.2em; color: var(--accent-cyan); }
                    .markdown-body h3 { font-size: 1em; color: var(--accent-blue); }
                    .markdown-body p { margin: 8px 0; }
                    .markdown-body ul, .markdown-body ol { padding-left: 20px; margin: 8px 0; }
                    .markdown-body li { margin: 6px 0; padding-left: 8px; list-style: disc; }
                    .markdown-body code {
                        background: rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.1);
                        border-radius: 4px; padding: 2px 6px; font-size: 13px; color: var(--accent-cyan);
                        font-family: 'JetBrains Mono', monospace;
                    }
                    .markdown-body pre {
                        background: rgba(0,0,0,0.6); border: 1px solid rgba(255,255,255,0.08);
                        border-radius: 8px; padding: 16px; overflow-x: auto; margin: 12px 0;
                    }
                    .markdown-body pre code { background: none; border: none; padding: 0; color: #e0e0e0; }
                    .markdown-body strong { color: white; font-weight: 900; }
                    .markdown-body blockquote {
                        border-left: 3px solid var(--accent-yellow); padding-left: 16px;
                        color: var(--text-muted); margin: 12px 0; font-style: italic;
                    }
                    .ai-message-card { animation: msg-slide-in 0.3s ease-out forwards; }
                    @keyframes msg-slide-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
                    .ai-content:hover { border-color: rgba(62,139,255,0.5) !important; }
                `}</style>
            </main>
        </div>
    );
};

export default Chat;