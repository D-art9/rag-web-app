import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface StudyChatProps {
    initialContext?: string;
    onBack?: () => void;
}

const StudyChat: React.FC<StudyChatProps> = ({ initialContext, onBack }) => {
    const [outline, setOutline] = useState<string>('');
    const [chatInput, setChatInput] = useState('');
    const [chatMessages, setChatMessages] = useState<{ sender: 'user' | 'ai', text: string }[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // If we have initial context passed from the RAG chat, use it to generating an outline
        if (initialContext) {
            generateInitialOutline(initialContext);
        } else {
            // Fallback or empty state
            setOutline(`## Welcome to Study Mode

**How this System Works:**
1.  **Export Context**: Used the "Study This" button in the main chat to bring relevant video content here.
2.  **Generate Outline**: The system analyzes the content to create a structured study guide (on the left).
3.  **Interactive Study**: Use the chat on the right to quiz yourself, ask for clarifications, or expand on specific topics.

*Start by exporting content from the main chat or asking a question on the right!*`);
        }
    }, [initialContext]);

    const generateInitialOutline = async (context: string) => {
        setIsLoading(true);
        // TODO: Call Backend API to generate outline using Gemini
        // For now, mock it to let frontend dev proceed
        setTimeout(() => {
            setOutline(`# Study Outline\n\nBased on your content: "${context.substring(0, 50)}..."\n\n## 1. Key Concepts\n- Concept A\n- Concept B\n\n## 2. Summary\nThis is a placeholder outline generated for UI testing.`);
            setIsLoading(false);
        }, 1500);
    };

    const handleSendChat = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!chatInput.trim()) return;

        const newUserMsg = { sender: 'user' as const, text: chatInput };
        setChatMessages(prev => [...prev, newUserMsg]);
        setChatInput('');

        // TODO: Call Backend API for chat
        setTimeout(() => {
            setChatMessages(prev => [...prev, { sender: 'ai', text: "I'm a placeholder AI. The backend is not connected yet." }]);
        }, 1000);
    };

    return (
        <div style={styles.container} className="fade-in">
            {/* Left Panel: Study Material / Outline */}
            <div style={styles.outlinePanel} className="custom-scroll">
                <div style={styles.header}>
                    <button onClick={onBack} style={styles.backButton}>← Back</button>
                    <h2>Study Guide</h2>
                </div>

                {isLoading ? (
                    <div style={styles.loading}>Generating Study Guide...</div>
                ) : (
                    <div className="markdown-content">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{outline}</ReactMarkdown>
                    </div>
                )}
            </div>

            {/* Right Panel: Chat with Gemini */}
            <div style={styles.chatPanel}>
                <div style={styles.chatHeader}>
                    <h3>Study Plan Analyser</h3>
                </div>

                <div style={styles.messages} className="custom-scroll">
                    {chatMessages.map((msg, idx) => (
                        <div key={idx} style={{
                            ...styles.message,
                            alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                            background: msg.sender === 'user' ? 'var(--accent-color)' : 'rgba(255,255,255,0.1)'
                        }}>
                            {msg.text}
                        </div>
                    ))}
                </div>

                <form onSubmit={handleSendChat} style={styles.inputForm}>
                    <input
                        value={chatInput}
                        onChange={e => setChatInput(e.target.value)}
                        placeholder="Ask a question about this topic..."
                        style={styles.input}
                    />
                    <button type="submit" style={styles.sendButton}>↑</button>
                </form>
            </div>
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    container: {
        display: 'grid',
        gridTemplateColumns: '1fr 400px',
        height: '100vh',
        maxWidth: '100%',
        margin: '0 auto',
        // "Studenty" background: A subtle dark blue-grey gradient, reminiscent of a blackboard or focused study environment
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        color: '#e0e0e0',
        fontFamily: "'Segoe UI', Roboto, sans-serif"
    },
    outlinePanel: {
        padding: '2.5rem',
        borderRight: '1px solid rgba(255, 255, 255, 0.1)',
        overflowY: 'auto',
        background: 'rgba(255, 255, 255, 0.02)', // Slightly lighter sheet effect
        boxShadow: 'inset -5px 0 15px rgba(0,0,0,0.2)' // Paper edge depth
    },
    chatPanel: {
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        background: 'rgba(0,0,0,0.25)',
        borderLeft: '1px solid rgba(0,0,0,0.3)'
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        marginBottom: '2rem',
        borderBottom: '1px solid var(--border-color)',
        paddingBottom: '1rem'
    },
    backButton: {
        background: 'transparent',
        border: 'none',
        color: 'var(--text-secondary)',
        cursor: 'pointer',
        fontSize: '1rem'
    },
    chatHeader: {
        padding: '1rem',
        borderBottom: '1px solid var(--border-color)',
        background: 'rgba(255,255,255,0.02)'
    },
    messages: {
        flex: 1,
        padding: '1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.8rem',
        overflowY: 'auto'
    },
    message: {
        padding: '0.8rem 1rem',
        borderRadius: '12px',
        maxWidth: '85%',
        fontSize: '0.9rem',
        lineHeight: 1.4
    },
    inputForm: {
        padding: '1rem',
        display: 'flex',
        gap: '0.5rem',
        borderTop: '1px solid var(--border-color)'
    },
    input: {
        flex: 1,
        padding: '0.8rem',
        borderRadius: '8px',
        border: '1px solid var(--border-color)',
        background: 'var(--surface-color)',
        color: 'white',
        outline: 'none'
    },
    sendButton: {
        width: '40px',
        borderRadius: '8px',
        border: 'none',
        background: 'var(--accent-color)',
        color: 'white',
        cursor: 'pointer'
    },
    loading: {
        color: 'var(--text-secondary)',
        textAlign: 'center',
        marginTop: '2rem'
    }
};

export default StudyChat;
