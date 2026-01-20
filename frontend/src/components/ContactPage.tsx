import React, { useState } from 'react';
import axios from 'axios';

interface ContactPageProps {
    onBack: () => void;
}

const ContactPage: React.FC<ContactPageProps> = ({ onBack }) => {
    const [name, setName] = useState('');
    const [message, setMessage] = useState('');
    const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim()) return;

        setStatus('sending');
        try {
            await axios.post('http://localhost:5000/api/contact', { name, message });
            setStatus('success');
            setName('');
            setMessage('');
        } catch (err) {
            console.error(err);
            setStatus('error');
        }
    };

    return (
        <div className="fade-in" style={styles.container}>
            <div className="mesh-bg"></div>

            <header style={styles.header}>
                <button onClick={onBack} style={styles.backButton}>← Back</button>
                <div style={styles.logo}>ScriptYT</div>
            </header>

            <div style={styles.content}>
                <div style={styles.card} className="slide-in">
                    <h1 style={styles.title}>Let's Connect 🤝</h1>
                    <p style={styles.subtitle}>
                        Send a message directly to my Telegram.
                    </p>

                    {status === 'success' ? (
                        <div className="fade-in" style={styles.successMessage}>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
                            <h3>Message Sent!</h3>
                            <p>Thanks for reaching out. I'll get back to you soon.</p>
                            <button onClick={() => setStatus('idle')} style={{ ...styles.button, marginTop: '2rem' }}>Send Another</button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} style={styles.form}>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Name (Optional)</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    style={styles.input}
                                    placeholder="Your Name"
                                />
                            </div>

                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Message</label>
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    style={styles.textarea}
                                    placeholder="What's on your mind?"
                                    required
                                />
                            </div>

                            {status === 'error' && (
                                <p style={{ color: '#ff4d4d', fontSize: '0.9rem' }}>Failed to send message. Please try again.</p>
                            )}

                            <button
                                type="submit"
                                style={{ ...styles.button, opacity: status === 'sending' ? 0.7 : 1 }}
                                disabled={status === 'sending'}
                            >
                                {status === 'sending' ? 'Sending...' : 'Send Message 🚀'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    container: {
        minHeight: '100vh',
        color: 'white',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
    },
    header: {
        padding: '2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'relative',
        zIndex: 10,
    },
    backButton: {
        background: 'transparent',
        border: '1px solid rgba(255,255,255,0.2)',
        color: 'white',
        padding: '0.8rem 1.5rem',
        borderRadius: '100px',
        cursor: 'pointer',
        fontSize: '0.9rem',
        transition: 'all 0.2s',
    },
    logo: {
        fontSize: '1.2rem',
        fontWeight: 800,
        letterSpacing: '-0.5px',
    },
    content: {
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        zIndex: 10,
        padding: '2rem',
    },
    card: {
        background: 'rgba(20, 20, 20, 0.8)',
        border: '1px solid rgba(255,255,255,0.1)',
        padding: '3rem',
        borderRadius: '24px',
        textAlign: 'center',
        width: '100%',
        maxWidth: '500px',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
    },
    title: {
        fontSize: '2.5rem',
        fontWeight: 800,
        marginBottom: '1rem',
        background: 'linear-gradient(to right, #fff, #aaa)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
    },
    subtitle: {
        fontSize: '1rem',
        color: 'var(--text-secondary)',
        marginBottom: '2rem',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        textAlign: 'left'
    },
    inputGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
    },
    label: {
        fontSize: '0.9rem',
        color: 'var(--text-secondary)',
        fontWeight: 500,
    },
    input: {
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)',
        padding: '1rem',
        borderRadius: '12px',
        color: 'white',
        fontSize: '1rem',
        outline: 'none',
    },
    textarea: {
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)',
        padding: '1rem',
        borderRadius: '12px',
        color: 'white',
        fontSize: '1rem',
        outline: 'none',
        minHeight: '120px',
        resize: 'vertical',
        fontFamily: 'inherit'
    },
    button: {
        background: 'var(--accent-color)',
        color: 'white',
        border: 'none',
        padding: '1rem',
        borderRadius: '12px',
        fontSize: '1rem',
        fontWeight: 700,
        cursor: 'pointer',
        transition: 'opacity 0.2s',
        marginTop: '0.5rem'
    },
    successMessage: {
        padding: '2rem 0'
    }
};

export default ContactPage;
