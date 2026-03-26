import React, { useState, useEffect } from 'react';
import { Play, Terminal, Info, Mail } from 'lucide-react';

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
      const response = await fetch('http://localhost:5000/api/documents/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();
      if (data.id) onUrlSubmit(url, data.id);
      else alert('Analysis Failed: ID_UNDEFINED');
    } catch (err) {
      console.error(err);
      alert('Network Error: [CONN_FAILURE]');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="bauhaus-landing">
      {/* HERO SECTION AS A COMPOSITION */}
      <div className="landing-composition">
        <header className="hero-text">
          <h1 className="heading-xl">SCRIPTYT <span className="text-stroke">{typedTitle}</span></h1>
          <p className="subtext-bauhaus">EXTRACT KNOWLEDGE FROM VIDEO SOURCES. MULTIMODAL RAG PIPELINE v2.0</p>
          
          <form onSubmit={handleSubmit} className="bauhaus-form">
            <input
              type="text"
              className="bauhaus-input"
              placeholder="PASTE_YOUTUBE_URL_HERE"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={isAnalyzing}
            />
            <button type="submit" className="btn-bauhaus btn-yellow bauhaus-shadow-sm">
              {isAnalyzing ? 'WORKING...' : 'ANALYZE_SOURCE'}
            </button>
          </form>
        </header>

        <aside className="hero-sidebar bauhaus-border btn-red bauhaus-shadow">
           <div className="sidebar-header">AVAILABLE_COMMANDS</div>
           <ul className="sidebar-list">
             <li>/analyze --url=[LINK]</li>
             <li>/history --view-all</li>
             <li>/clear --all-cache</li>
           </ul>
           <div className="geom-shapes">
              <div className="shape circle yellow-shape"></div>
              <div className="shape triangle-up blue-shape"></div>
           </div>
        </aside>
      </div>

      <style>{`
        .bauhaus-landing {
          padding: 3rem;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .landing-composition {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 2rem;
          width: 100%;
          max-width: 1200px;
        }

        .hero-text {
          padding: 2rem 0;
        }

        .text-stroke {
          -webkit-text-stroke: 1.5px black;
          color: transparent;
        }

        .subtext-bauhaus {
          font-weight: 900;
          font-size: 1.2rem;
          margin-bottom: 3rem;
          letter-spacing: 0.1em;
          color: var(--primary-red);
        }

        /* FORM */
        .bauhaus-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          max-width: 500px;
        }

        .bauhaus-input {
          padding: 1.5rem;
          background: white;
          border: 4px solid black;
          font-family: inherit;
          font-weight: 900;
          font-size: 1.1rem;
          outline: none;
        }

        .bauhaus-input:focus {
           background: #FFF9C4;
        }

        /* SIDEBAR */
        .hero-sidebar {
          padding: 2rem;
          display: flex;
          flex-direction: column;
          background: var(--primary-red);
        }

        .sidebar-header {
           font-weight: 900;
           font-size: 0.8rem;
           margin-bottom: 2rem;
           border-bottom: 2px solid white;
           padding-bottom: 0.5rem;
        }

        .sidebar-list {
          list-style: none;
          font-weight: 900;
          font-size: 1.1rem;
          gap: 0.8rem;
          display: flex;
          flex-direction: column;
        }

        .geom-shapes {
          margin-top: auto;
          display: flex;
          gap: 1rem;
          padding-top: 2rem;
        }

        .shape { width: 40px; height: 40px; }
        .yellow-shape { background: var(--primary-yellow); border-radius: 999px; }
        .blue-shape { 
          width: 0; 
          height: 0; 
          border-left: 20px solid transparent;
          border-right: 20px solid transparent;
          border-bottom: 40px solid var(--primary-blue);
        }

        @media (max-width: 800px) {
          .landing-composition { grid-template-columns: 1fr; }
          .bauhaus-landing { padding: 1.5rem; }
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
