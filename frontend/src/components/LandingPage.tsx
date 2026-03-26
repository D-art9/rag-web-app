import React, { useState } from 'react';
import { uploadDocument } from '../services/api';
import LoadingScreen from './LoadingScreen';

interface LandingPageProps {
  onUrlSubmit: (url: string, id: string) => void;
  onNavigate: (view: 'landing' | 'chat' | 'dataflow' | 'contact' | 'study') => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onUrlSubmit, onNavigate }) => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setLoading(true);
    setError('');

    try {
      const response = await uploadDocument(url);
      onUrlSubmit(url, response.id);
    } catch (err: any) {
      setError(err.message || 'Failed to analyze video');
      setLoading(false);
    }
  };

  if (loading) return <LoadingScreen message="Extracting Knowledge..." />;

  return (
    <div className="landing-view">
      <header className="hero-section">
        <h1 className="hero-title">
          Master Any <span className="highlight-text">Video</span> in Seconds
        </h1>
        <p className="hero-subtitle">
          Turn long YouTube videos into structured study notes, AI-powered summaries, and interactive chat.
        </p>
      </header>

      <section className="input-section glass-panel neon-glow-purple">
        <form onSubmit={handleSubmit} className="url-form">
          <div className="input-wrapper glass-card">
            <span className="input-icon">📹</span>
            <input
              type="text"
              placeholder="Paste YouTube Video URL here..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="url-input"
            />
            <button type="submit" className="submit-btn neon-glow-cyan">
              Analyze Video
            </button>
          </div>
          {error && <p className="error-message">{error}</p>}
        </form>

        <div className="feature-grid">
          <div className="feature-item">
            <span className="f-icon">📝</span>
            <h3>Smart Summaries</h3>
            <p>Get the core takeaways instantly.</p>
          </div>
          <div className="feature-item">
            <span className="f-icon">💬</span>
            <h3>AI Chat Assistant</h3>
            <p>Ask anything about the video content.</p>
          </div>
          <div className="feature-item">
            <span className="f-icon">⚡</span>
            <h3>Zero Delay</h3>
            <p>Ready to study in less than 30 seconds.</p>
          </div>
        </div>
      </section>

      <style>{`
        .landing-view {
          padding-top: 5vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 3rem;
        }

        .hero-section {
          text-align: center;
          max-width: 800px;
        }

        .hero-title {
          font-size: 3.5rem;
          font-weight: 800;
          letter-spacing: -2px;
          margin-bottom: 1.5rem;
          line-height: 1.1;
        }

        .highlight-text {
          color: var(--accent-primary);
          text-shadow: 0 0 20px rgba(0, 247, 255, 0.4);
        }

        .hero-subtitle {
          font-size: 1.25rem;
          color: var(--text-secondary);
          max-width: 600px;
          margin: 0 auto;
        }

        .input-section {
          width: 100%;
          max-width: 900px;
          padding: 3rem;
          border-radius: var(--radius-lg);
          display: flex;
          flex-direction: column;
          gap: 3rem;
        }

        .input-wrapper {
          display: flex;
          padding: 0.5rem;
          gap: 0.5rem;
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.05);
        }

        .input-icon {
          padding: 0 1rem;
          display: flex;
          align-items: center;
          font-size: 1.5rem;
        }

        .url-input {
          flex-grow: 1;
          background: transparent;
          border: none;
          color: #fff;
          font-size: 1.1rem;
          padding: 1rem;
          outline: none;
        }

        .submit-btn {
          padding: 1rem 2rem;
          background: var(--accent-primary);
          border: none;
          color: #000;
          font-weight: 700;
          font-size: 1rem;
          border-radius: 12px;
          cursor: pointer;
          transition: transform 0.2s ease;
        }

        .submit-btn:hover {
          transform: translateY(-2px);
          filter: brightness(1.1);
        }

        .feature-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
        }

        .feature-item {
          text-align: center;
          padding: 1.5rem;
          background: rgba(255, 255, 255, 0.02);
          border-radius: 16px;
        }

        .f-icon { font-size: 1.5rem; margin-bottom: 1rem; display: block; }
        .feature-item h3 { font-size: 1rem; margin-bottom: 0.5rem; }
        .feature-item p { font-size: 0.8rem; color: var(--text-secondary); }

        .error-message {
          color: #ff4d4d;
          margin-top: 1rem;
          font-size: 0.9rem;
          text-align: center;
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
