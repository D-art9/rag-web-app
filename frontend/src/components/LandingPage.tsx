import React, { useState, useEffect } from 'react';
import { uploadDocument } from '../services/api';
import LoadingScreen from './LoadingScreen';

interface LandingPageProps {
  onUrlSubmit: (url: string, id: string) => void;
  onNavigate: (view: any) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onUrlSubmit, onNavigate }) => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [typedHeader, setTypedHeader] = useState('');
  const fullHeader = "INITIATING SYSTEM PROTOCOL: SCRIPTYT_RECOVERY_NODE...";

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      setTypedHeader(fullHeader.substring(0, index));
      index++;
      if (index > fullHeader.length) clearInterval(interval);
    }, 40);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    setLoading(true);
    setError('');

    try {
      const resp = await uploadDocument(url);
      onUrlSubmit(url, resp.id);
    } catch (err: any) {
      setError(`[ERR_STATUS]: ${err.message || "UNABLE TO ANALYZE VIDEO SOURCE"}`);
      setLoading(false);
    }
  };

  if (loading) return <LoadingScreen message="UPDATING SYSTEM SEGMENTS..." />;

  return (
    <div className="terminal-landing">
      <div className="landing-header">
        <h1 className="heading">{typedHeader}</h1>
        <p className="subtext">// ANALYZE_YOUTUBE_SOURCE [TARGET_URL_REQUIRED]</p>
      </div>

      <form onSubmit={handleSubmit} className="terminal-form">
        <div className="form-prompt">
          <span className="prompt-char">root@scriptyt:~$</span>
          <input
            type="text"
            className="term-input url-field"
            placeholder="0xYT_SOURCE_HERE..."
            autoFocus
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <button type="submit" className="term-btn analyze-btn">
            RUN_ANALYZE_v2.0
          </button>
        </div>
        {error && <div className="term-error">| {error} |</div>}
      </form>

      <div className="system-specs">
        <div className="spec-pane pane">
          <div className="pane-header">SYSTEM_STATS</div>
          <div className="pane-content">
             <p>CPU_LOAD: [||||||||||.....] 68%</p>
             <p>DISK_USAGE: [||||||.......] 42%</p>
             <p>RAG_ENGINE: [ENABLED]</p>
             <p>MOD: PHOSPHOR_GREEN</p>
          </div>
        </div>

        <div className="spec-pane pane">
          <div className="pane-header">AVAILABLE_COMMANDS</div>
          <div className="pane-content">
             <p>> /analyze --url=[LINK]</p>
             <p>> /history --view-all</p>
             <p>> /clear --all-cache</p>
          </div>
        </div>
      </div>

      <style>{`
        .terminal-landing {
          padding: 2rem;
          display: flex;
          flex-direction: column;
          gap: 3rem;
          height: 100%;
        }

        .heading { font-size: 2.2rem; }
        .subtext { color: var(--muted-color); font-size: 0.8rem; margin-top: 0.5rem; }

        .terminal-form {
          margin-top: 2rem;
        }

        .form-prompt {
          display: flex;
          align-items: center;
          gap: 1.2rem;
          font-size: 1.2rem;
        }

        .prompt-char { color: var(--secondary-color); font-weight: bold; }

        .url-field {
          flex-grow: 1;
          font-size: 1.2rem;
          padding: 0.5rem;
          color: var(--primary-color);
        }

        .analyze-btn {
          font-size: 0.9rem;
        }

        .term-error {
          color: var(--error-color);
          margin-top: 1.5rem;
          font-weight: bold;
          font-size: 0.9rem;
        }

        .system-specs {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
          margin-top: auto;
        }

        .pane-content {
          padding: 1rem;
          font-size: 0.8rem;
          line-height: 1.6;
        }

        @media (max-width: 800px) {
          .system-specs { grid-template-columns: 1fr; }
          .form-prompt { flex-direction: column; align-items: flex-start; }
          .url-field { width: 100%; }
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
