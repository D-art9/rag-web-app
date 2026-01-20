import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { sendMessage, fetchVideoHistory } from '../services/api';

interface ChatProps {
    videoUrl: string;
    videoId: string;
    onSelectVideo?: (url: string, id: string) => void;
}

interface Message {
    text: string;
    sender: 'user' | 'ai';
    sources?: string[];
    isTyping?: boolean; // For typewriter effect state
}

interface VideoHistoryItem {
    id: string;
    url: string;
    title: string;
    thumbnail: string;
    uploadedAt: string;
}

// Typewriter Component
const TypewriterMessage: React.FC<{ text: string; onComplete?: () => void }> = ({ text, onComplete }) => {
    const [displayedText, setDisplayedText] = useState('');
    const indexRef = useRef(0);

    useEffect(() => {
        indexRef.current = 0;
        setDisplayedText('');

        const interval = setInterval(() => {
            if (indexRef.current < text.length) {
                setDisplayedText((prev) => prev + text.charAt(indexRef.current));
                indexRef.current++;
            } else {
                clearInterval(interval);
                if (onComplete) onComplete();
            }
        }, 15); // Speed of typing

        return () => clearInterval(interval);
    }, [text, onComplete]);

    return <ReactMarkdown remarkPlugins={[remarkGfm]}>{displayedText}</ReactMarkdown>;
};



const CitationList: React.FC<{ sources: string[] }> = ({ sources }) => {
    const [isOpen, setIsOpen] = useState(false);

    const cleanSource = (source: string) => {
        // Remove .txt extension
        let cleaned = source.replace(/\.txt$/, '');
        // Remove trailing YouTube ID (11 chars) if present (e.g. -abcdef12345)
        cleaned = cleaned.replace(/-\w{11}$/, '');
        // Replace underscores with spaces
        cleaned = cleaned.replace(/_/g, ' ');
        return cleaned;
    };

    return (
        <div style={styles.citationContainer}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={styles.citationToggle}
            >
                {isOpen ? '📚 Hide Sources' : '📚 Show Sources'}
            </button>

            {isOpen && (
                <div style={styles.sourcesList} className="fade-in">
                    {sources.map((source, i) => (
                        <div key={i} style={styles.sourceItem}>
                            • {cleanSource(source)}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const Chat: React.FC<ChatProps> = ({ videoUrl, videoId, onSelectVideo }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);
    const [history, setHistory] = useState<VideoHistoryItem[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Fetch history
    useEffect(() => {
        const loadHistory = async () => {
            try {
                const videos = await fetchVideoHistory();
                setHistory(videos);
            } catch (error) {
                console.error("Failed to load history", error);
            }
        };
        loadHistory();
    }, [videoId]);

    // Initial message
    useEffect(() => {
        setIsLoading(false);
        setMessages([
            { text: `Analysis complete! What would you like to know about this video?`, sender: 'ai' }
        ]);
    }, [videoId]);

    // Auto-scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, input]); // Also scroll on input to keep focus

    const handleSendMessage = async (e?: React.FormEvent, textOverride?: string) => {
        if (e) e.preventDefault();
        const textToSend = textOverride || input;

        if (!textToSend.trim()) return;

        // 1. Add User Message
        const userMsg: Message = { text: textToSend, sender: 'user' };
        setMessages(prev => [...prev, userMsg]);
        setInput('');

        try {
            // 2. Add AI Placeholder (Typing state implicitly handled by Typewriter component when message is added)
            // But we wait for response first usually. 
            // Better UX: Show "Thinking..." or just wait. 
            // Let's wait for response then stream it.

            const response = await sendMessage(textToSend, videoId);

            setMessages(prev => [...prev, {
                text: response.answer,
                sender: 'ai',
                sources: response.sources,
                isTyping: true // Mark as needing typing effect
            }]);

        } catch (err) {
            setMessages(prev => [...prev, {
                text: "Sorry, I encountered an error processing your request. Please try again.",
                sender: 'ai'
            }]);
        }
    };

    const currentVideo = history.find(v => v.id === videoId);

    if (isLoading) {
        return (
            <div style={styles.loadingContainer} className="fade-in">
                <div style={styles.spinner}></div>
                <p>Analyzing video content...</p>
            </div>
        );
    }

    return (
        <div style={styles.container} className="fade-in">
            <div style={styles.sidebar} className="custom-scroll">
                <div style={styles.videoCard}>
                    {/* Thumbnail */}
                    {currentVideo && currentVideo.thumbnail ? (
                        <img src={currentVideo.thumbnail} alt="Video Preview" style={styles.videoPreview} />
                    ) : (
                        <div style={styles.videoPreviewPlaceholder}></div>
                    )}
                    <p style={styles.videoTitle}>{currentVideo ? currentVideo.title : 'Current Video'}</p>
                    <p style={styles.videoMeta}>Active Session</p>
                </div>

                <div className="slide-in" style={{ ...styles.infoBox, animationDelay: '0.3s' }}>
                    <h3>Recent Videos</h3>
                    <div style={styles.historyList}>
                        {history.map((video) => (
                            <div
                                key={video.id}
                                style={{
                                    ...styles.historyItem,
                                    borderColor: video.id === videoId ? 'var(--accent-color)' : 'transparent',
                                    background: video.id === videoId ? 'rgba(255,255,255,0.05)' : 'transparent'
                                }}
                                onClick={() => onSelectVideo && onSelectVideo(video.url, video.id)}
                            >
                                <div style={styles.historyThumbnail}>
                                    {video.thumbnail ? (
                                        <img src={video.thumbnail} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <div style={{ width: '100%', height: '100%', background: '#333' }}></div>
                                    )}
                                </div>
                                <div style={styles.historyInfo}>
                                    <div style={styles.historyTitle}>{video.title || 'Untitled Video'}</div>
                                    <div style={styles.historyDate}>{new Date(video.uploadedAt).toLocaleDateString()}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div style={styles.chatArea}>
                <div style={styles.messages} className="custom-scroll">
                    {messages.map((msg, index) => (
                        <div
                            key={index}
                            style={{
                                ...styles.message,
                                alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                                backgroundColor: msg.sender === 'user' ? 'var(--accent-color)' : 'var(--surface-color)',
                                color: msg.sender === 'user' ? 'white' : 'var(--text-primary)',
                            }}
                            className={msg.sender === 'user' ? "slide-in-right" : "slide-in-left"}
                        >
                            <div className="markdown-content">
                                {msg.sender === 'ai' && msg.isTyping ? (
                                    <TypewriterMessage
                                        text={msg.text}
                                        onComplete={() => {
                                            // Optional: remove isTyping flag to prevent re-typing on re-renders
                                            // Ideally we'd map this, but effectively just running it once per mounting component works well enough
                                        }}
                                    />
                                ) : (
                                    msg.sender === 'ai' ?
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown> :
                                        msg.text
                                )}
                            </div>

                            {msg.sender === 'ai' && msg.sources && msg.sources.length > 0 && (
                                <CitationList sources={msg.sources} />
                            )}
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input area remains same */}
                <div style={styles.inputWrapper}>
                    {/* Suggested Chips */}
                    <div style={styles.chipsContainer}>
                        <button onClick={() => handleSendMessage(undefined, "Summarize this video")} style={styles.chip}>Summarize this</button>
                        <button onClick={() => handleSendMessage(undefined, "What are the key technical takeaways?")} style={styles.chip}>Key Takeaways</button>
                        <button onClick={() => handleSendMessage(undefined, "Who is the speaker?")} style={styles.chip}>Who is speaking?</button>
                    </div>

                    <form onSubmit={(e) => handleSendMessage(e)} style={styles.inputForm}>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask anything about the video..."
                            style={styles.input}
                        />
                        <button type="submit" style={styles.sendButton}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                            </svg>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    container: {
        display: 'grid',
        gridTemplateColumns: '320px 1fr',
        height: '100vh',
        maxWidth: '1600px',
        margin: '0 auto',
        overflow: 'hidden',
    },
    sidebar: {
        padding: '2rem',
        borderRight: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem',
        background: 'rgba(255, 255, 255, 0.02)',
        overflowY: 'auto',
    },
    videoCard: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
    },
    videoPreview: {
        width: '100%',
        aspectRatio: '16/9',
        backgroundColor: 'var(--surface-color)',
        borderRadius: '8px',
        border: '1px solid var(--border-color)',
        objectFit: 'cover',
    },
    videoPreviewPlaceholder: {
        width: '100%',
        aspectRatio: '16/9',
        backgroundColor: 'var(--surface-color)',
        borderRadius: '8px',
        border: '1px solid var(--border-color)',
    },
    videoTitle: {
        fontWeight: 600,
        fontSize: '1rem',
        marginTop: '0.5rem',
        lineHeight: 1.3,
    },
    videoMeta: {
        color: 'var(--text-secondary)',
        fontSize: '0.8rem',
    },
    infoBox: {
        background: 'var(--surface-color)',
        padding: '1.2rem',
        borderRadius: '12px',
        border: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        flex: 1,
    },
    historyList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        overflowY: 'auto',
    },
    historyItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.5rem',
        borderRadius: '8px',
        cursor: 'pointer',
        border: '1px solid transparent',
        transition: 'all 0.2s',
    },
    historyThumbnail: {
        width: '48px',
        height: '36px',
        borderRadius: '4px',
        overflow: 'hidden',
        flexShrink: 0,
    },
    historyInfo: {
        flex: 1,
        overflow: 'hidden',
    },
    historyTitle: {
        fontSize: '0.85rem',
        fontWeight: 500,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    },
    historyDate: {
        fontSize: '0.7rem',
        color: 'var(--text-secondary)',
        marginBottom: 0,
    },
    chatArea: {
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
    },
    messages: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        overflowY: 'auto',
        padding: '2rem',
        paddingBottom: '1rem',
        minHeight: 0,
    },
    message: {
        maxWidth: '75%', // Increased for better markdown reading
        padding: '1rem 1.5rem',
        borderRadius: '18px',
        fontSize: '0.95rem',
        lineHeight: 1.6,
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    inputWrapper: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        background: 'var(--bg-color)',
        padding: '1rem 2rem 2rem 2rem',
        borderTop: '1px solid var(--border-color)',
        flexShrink: 0,
    },
    chipsContainer: {
        display: 'flex',
        gap: '0.5rem',
        overflowX: 'auto',
        paddingBottom: '0.5rem',
    },
    chip: {
        background: 'var(--surface-color)',
        border: '1px solid var(--border-color)',
        color: 'var(--text-secondary)',
        padding: '0.4rem 1rem',
        borderRadius: '100px',
        fontSize: '0.8rem',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        transition: 'all 0.2s',
    },
    inputForm: {
        display: 'flex',
        gap: '0.75rem',
    },
    input: {
        flex: 1,
        borderRadius: '100px',
        padding: '1rem 1.5rem',
        fontSize: '1rem',
        background: 'var(--surface-color)',
        border: '1px solid var(--border-color)',
        color: 'white',
        outline: 'none',
    },
    sendButton: {
        width: '50px',
        height: '50px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 0,
        background: 'var(--accent-color)',
        border: 'none',
        cursor: 'pointer',
        transition: 'transform 0.1s',
    },
    loadingContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        gap: '1.5rem',
        color: 'var(--text-secondary)',
    },
    spinner: {
        width: '40px',
        height: '40px',
        border: '3px solid var(--surface-color)',
        borderTopColor: 'var(--accent-color)',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
    },
    sources: {
        marginTop: '1rem',
        paddingTop: '0.75rem',
        borderTop: '1px solid rgba(255,255,255,0.1)',
        fontSize: '0.75rem',
        color: 'var(--text-secondary)',
    },
    sourcesLabel: {
        fontWeight: 600,
        marginBottom: '0.25rem',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
    },
    sourceItem: {
        opacity: 0.8,
        fontStyle: 'italic',
        lineHeight: 1.4,
        marginBottom: '0.25rem',
        fontSize: '0.85rem'
    },
    citationContainer: {
        marginTop: '0.8rem',
    },
    citationToggle: {
        background: 'transparent',
        border: '1px solid rgba(255,255,255,0.2)',
        color: 'var(--text-secondary)',
        padding: '0.3rem 0.8rem',
        borderRadius: '100px',
        fontSize: '0.75rem',
        cursor: 'pointer',
        transition: 'all 0.2s',
        display: 'inline-block'
    },
    sourcesList: {
        marginTop: '0.8rem',
        padding: '0.8rem',
        background: 'rgba(0,0,0,0.2)',
        borderRadius: '8px',
        border: '1px solid rgba(255,255,255,0.05)'
    }
};

// Add styles for markdown content and animations
const styleSheet = document.createElement("style");
styleSheet.innerText = `
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  .history-item:hover {
      background: rgba(255,255,255,0.03);
  }
  .slide-in-right {
      animation: slideInRight 0.3s ease-out;
  }
  .slide-in-left {
      animation: slideInLeft 0.3s ease-out;
  }
  @keyframes slideInRight {
      from { opacity: 0; transform: translateX(20px); }
      to { opacity: 1; transform: translateX(0); }
  }
  @keyframes slideInLeft {
      from { opacity: 0; transform: translateX(-20px); }
      to { opacity: 1; transform: translateX(0); }
  }
  /* Markdown Styles */
  .markdown-content p {
      margin-bottom: 0.5rem;
  }
  .markdown-content p:last-child {
      margin-bottom: 0;
  }
  .markdown-content strong {
      color: var(--accent-color);
      font-weight: 700;
  }
  .markdown-content ul, .markdown-content ol {
      padding-left: 1.2rem;
      margin-bottom: 0.5rem;
  }
  .markdown-content code {
      background: rgba(0,0,0,0.3);
      padding: 0.2rem 0.4rem;
      borderRadius: 4px;
      font-family: monospace;
      font-size: 0.9em;
  }
`;
document.head.appendChild(styleSheet);

export default Chat;