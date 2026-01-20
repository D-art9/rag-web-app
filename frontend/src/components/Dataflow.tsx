import React from 'react';

interface DataflowProps {
    onBack: () => void;
}

const Dataflow: React.FC<DataflowProps> = ({ onBack }) => {
    return (
        <div className="fade-in" style={styles.container}>
            <div className="mesh-bg"></div>

            <header style={styles.header}>
                <button onClick={onBack} style={styles.backButton}>← Back</button>
                <h1 style={styles.title}>The Magic Under the Hood 🪄</h1>
            </header>

            <div style={styles.flowContainer}>
                {/* Step 1: Input */}
                <div className="slide-in" style={{ ...styles.stepCard, animationDelay: '0.1s' }}>
                    <div style={styles.icon}>🔗</div>
                    <h3>1. Input</h3>
                    <p>User provides a YouTube URL.</p>
                </div>

                <div className="fade-in" style={{ ...styles.arrow, animationDelay: '0.2s' }}>↓</div>

                {/* Step 2: Extraction */}
                <div className="slide-in" style={{ ...styles.stepCard, animationDelay: '0.3s' }}>
                    <div style={styles.icon}>⬇️</div>
                    <h3>2. Extraction (yt-dlp)</h3>
                    <p>We use <strong>yt-dlp</strong> to securely extract transcript data and metadata directly from YouTube's internal API.</p>
                </div>

                <div className="fade-in" style={{ ...styles.arrow, animationDelay: '0.4s' }}>↓</div>

                {/* Step 3: Chunking */}
                <div className="slide-in" style={{ ...styles.stepCard, animationDelay: '0.5s' }}>
                    <div style={styles.icon}>✂️</div>
                    <h3>3. Smart Chunking</h3>
                    <p>Transcripts are split into <strong>800-character segments</strong> to preserve context while fitting into vector windows.</p>
                </div>

                <div className="fade-in" style={{ ...styles.arrow, animationDelay: '0.6s' }}>↓</div>

                {/* Step 4: Embedding */}
                <div className="slide-in" style={{ ...styles.stepCard, animationDelay: '0.7s' }}>
                    <div style={styles.icon}>🔢</div>
                    <h3>4. Vectorization</h3>
                    <p>Each chunk is converted into a 384-dimensional vector using the <strong>all-MiniLM-L6-v2</strong> model.</p>
                </div>

                <div className="fade-in" style={{ ...styles.arrow, animationDelay: '0.8s' }}>↓</div>

                {/* Step 5: Retrieval */}
                <div className="slide-in" style={{ ...styles.stepCard, animationDelay: '0.9s' }}>
                    <div style={styles.icon}>🔍</div>
                    <h3>5. Semantic Search</h3>
                    <p>When you ask a question, we compare your query's vector against the database to find the top relevant chunks (Cosine Similarity &gt; 0.15).</p>
                </div>

                <div className="fade-in" style={{ ...styles.arrow, animationDelay: '1.0s' }}>↓</div>

                {/* Step 6: Synthesis */}
                <div className="slide-in" style={{ ...styles.stepCard, animationDelay: '1.1s', borderColor: 'var(--accent-color)' }}>
                    <div style={styles.icon}>🤖</div>
                    <h3>6. LLM Synthesis</h3>
                    <p>Groq (Llama 3) reads the retrieved context and generates a precise, natural language answer.</p>
                </div>
            </div>
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    container: {
        minHeight: '100vh',
        padding: '2rem',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    header: {
        width: '100%',
        maxWidth: '800px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        marginBottom: '4rem',
    },
    backButton: {
        position: 'absolute',
        left: 0,
        background: 'rgba(255,255,255,0.1)',
        border: 'none',
        color: 'white',
        padding: '0.5rem 1rem',
        borderRadius: '8px',
        cursor: 'pointer',
    },
    title: {
        fontSize: '2.5rem',
        fontWeight: 800,
        textAlign: 'center',
    },
    flowContainer: {
        maxWidth: '600px',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1rem',
        paddingBottom: '4rem',
    },
    stepCard: {
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.1)',
        padding: '2rem',
        borderRadius: '16px',
        width: '100%',
        textAlign: 'center',
        backdropFilter: 'blur(10px)',
        transition: 'transform 0.3s ease',
    },
    icon: {
        fontSize: '2.5rem',
        marginBottom: '1rem',
    },
    arrow: {
        fontSize: '2rem',
        color: 'var(--accent-color)',
        opacity: 0.8,
    },
};

export default Dataflow;
