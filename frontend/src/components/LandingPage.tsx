import React, { useState, useEffect } from 'react';
import LoadingScreen from './LoadingScreen';

interface LandingPageProps {
  onUrlSubmit: (url: string, id: string) => void;
  onNavigate: (view: string) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onUrlSubmit, onNavigate }) => {
  const [url, setUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [typedTitle, setTypedTitle] = useState('');
  
  const fullTitle = "ANALYZER";

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setTypedTitle(fullTitle.slice(0, i));
      i++;
      if (i > fullTitle.length) clearInterval(interval);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || isAnalyzing) return;

    setIsAnalyzing(true);
    try {
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://scriptyt-test-laptop.loca.lt/api';
      const response = await fetch(`${API_BASE_URL}/documents/upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();
      if (data.id) onUrlSubmit(url, data.id);
      else throw new Error('MISSION_ABORTED: NO_DATA_BACK');
    } catch (err) {
      console.error(err);
      alert('Network Error: [CONN_FAILURE_OR_503]');
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (isAnalyzing) return <LoadingScreen message="CONVERGING_NEURAL_PIPELINES..." />;

  return (
    <div className="bauhaus-landing">
      <div className="landing-composition">
        {/* ASYMMETRIC HEADER SECTION */}
        <section className="hero-block">
          <div className="bauhaus-label">SCRIPTYT_v2.1</div>
          <h1 className="heading-lg main-title">MULTIMODAL_<span className="typed-text">{typedTitle}</span>_</h1>
          <p className="hero-description">
            CONSTRUCTIVIST_INTELLIGENCE: 🛰️ GENERATING SEMANTIC INSIGHTS FROM YOUTUBE TRANSCRIPTS AND VISUAL THUMBNAILS VIA GEMINI.
          </p>
        </section>

        {/* INPUT COMPOSITION */}
        <section className="input-composition">
           <form onSubmit={handleSubmit} className="analyzer-form">
              <div className="input-group bauhaus-border">
                <input 
                  type="text" 
                  className="url-input" 
                  placeholder="PASTE_YOUTUBE_URL_HERE..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
              </div>
              <button 
                type="submit" 
                className="btn-bauhaus btn-red bauhaus-shadow"
                disabled={isAnalyzing}
              >
                {isAnalyzing ? 'SCANN_DATA...' : 'ANALYZE_SOURCE'}
              </button>
           </form>
        </section>

        {/* GEOMETRIC NAVIGATION BLOCKS */}
        <section className="nav-blocks">
           <div className="nav-card btn-blue bauhaus-border bauhaus-shadow-sm" onClick={() => onNavigate('playground')}>
              <div className="card-index">01</div>
              <div className="card-label">EXPLORE_LIBRARY</div>
           </div>
           <div className="nav-card btn-yellow bauhaus-border bauhaus-shadow-sm" onClick={() => onNavigate('dataflow')}>
              <div className="card-index">02</div>
              <div className="card-label">DATA_FLOW_MAP</div>
           </div>
           <div className="nav-card bauhaus-border bauhaus-shadow-sm" style={{ background: 'white', color: 'black' }} onClick={() => onNavigate('contact')}>
              <div className="card-index">03</div>
              <div className="card-label">CONTACT_CONTROL</div>
           </div>
        </section>
      </div>

      <style>{`
        .bauhaus-landing {
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          min-height: 100%; padding: 4rem 2rem;
          background: var(--bg-color); color: var(--foreground);
          transition: background 0.4s ease, color 0.4s ease;
        }

        .landing-composition { max-width: 1000px; width: 100%; display: flex; flex-direction: column; gap: 4rem; }

        .hero-block { border-left: 8px solid var(--primary-red); padding-left: 2rem; }
        .bauhaus-label { font-weight: 900; color: var(--primary-red); letter-spacing: 0.2em; margin-bottom: 0.5rem; }
        .main-title { margin: 0; }
        .typed-text { color: var(--primary-blue); border-right: 4px solid var(--primary-red); padding-right: 4px; animation: blink 0.8s infinite; }
        .hero-description { max-width: 600px; margin-top: 1.5rem; font-weight: 500; font-size: 1.1rem; line-height: 1.5; opacity: 0.8; }

        @keyframes blink { 50% { border-color: transparent; } }

        /* INPUT */
        .analyzer-form { display: flex; gap: 1rem; align-items: stretch; }
        .input-group { flex-grow: 1; display: flex; background: var(--pane-bg); color: var(--foreground); }
        .url-input { 
          flex-grow: 1; border: none; padding: 2rem; 
          font-weight: 900; font-size: 1.2rem; font-family: inherit; 
          background: transparent; color: inherit; outline: none;
        }

        .btn-bauhaus { padding: 0 4rem; font-weight: 900; font-size: 1.2rem; cursor: pointer; text-transform: uppercase; transition: transform 0.1s; }
        .btn-bauhaus:active { transform: translate(4px, 4px); box-shadow: none; }

        /* NAV BLOCKS */
        .nav-blocks { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 2rem; }
        .nav-card { padding: 2.5rem; cursor: pointer; transition: transform 0.2s; }
        .nav-card:hover { transform: translateY(-5px); }
        .card-index { font-weight: 900; font-size: 1.2rem; margin-bottom: 0.5rem; opacity: 0.6; }
        .card-label { font-weight: 900; font-size: 1.5rem; text-transform: uppercase; line-height: 1; }

        @media (max-width: 800px) {
          .analyzer-form { flex-direction: column; }
          .btn-bauhaus { padding: 1.5rem; }
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
