import React, { useState } from 'react';
import LandingPage from './components/LandingPage';
import Chat from './components/Chat';
import SearchPlayground from './components/SearchPlayground';
import Dataflow from './components/Dataflow';
import ContactPage from './components/ContactPage';
import StudyChat from './components/StudyChat';
import { Circle, Square, Triangle } from 'lucide-react';
import './index.css';

type View = 'landing' | 'chat' | 'dataflow' | 'contact' | 'study' | 'playground';

const App: React.FC = () => {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [docId, setDocId] = useState<string | null>(null);
  const [ytId, setYtId] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<View>('landing');
  const [studyContext, setStudyContext] = useState<string>('');

  const handleUrlSubmit = (url: string, id: string) => {
    let youtubeId = '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) youtubeId = match[2];

    setVideoUrl(url);
    setDocId(id);
    setYtId(youtubeId);
    setCurrentView('chat');
  };

  const handleResultClick = (id: string, url: string, title: string, thumb: string) => {
    let youtubeId = '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) youtubeId = match[2];

    setVideoUrl(url);
    setDocId(id);
    setYtId(youtubeId);
    setCurrentView('chat');
  };

  const navItems = [
    { id: 'landing', label: '01_START', color: 'var(--primary-red)' },
    { id: 'chat', label: '02_WORKSPACE', color: 'var(--primary-blue)' },
    { id: 'playground', label: '03_EXPLORE', color: 'var(--primary-yellow)' },
    { id: 'study', label: '04_KNOWLEDGE', color: 'var(--foreground)' },
  ];

  return (
    <div className="bauhaus-root">
      {/* ASYMMETRIC NAVIGATION PANEL */}
      <nav className="bauhaus-nav bauhaus-border">
         <div className="brand-logo">
            <Circle className="logo-shape" fill="var(--primary-red)" color="transparent" size={32} />
            <Square className="logo-shape" fill="var(--primary-blue)" color="transparent" size={32} />
            <Triangle className="logo-shape" fill="var(--primary-yellow)" color="transparent" size={32} />
            <div className="logo-text">SCRIPTYT</div>
         </div>

         <div className="nav-links">
           {navItems.map((item) => (
             <button
               key={item.id}
               className={`nav-btn ${currentView === item.id ? 'active' : ''}`}
               onClick={() => setCurrentView(item.id as View)}
               style={{ '--accent-color': item.color } as any}
             >
               <span className="btn-index">{item.label.split('_')[0]}</span>
               <span className="btn-label">{item.label.split('_')[1]}</span>
             </button>
           ))}
         </div>

         <div className="nav-footer">
            <div className="status-badge">SYSTEM_v2.0</div>
         </div>
      </nav>

      {/* MAIN CONTENT CANVAS */}
      <main className="bauhaus-viewport">
        {currentView === 'landing' && (
          <LandingPage onUrlSubmit={handleUrlSubmit} onNavigate={(v: any) => setCurrentView(v)} />
        )}

        {currentView === 'playground' && (
          <div className="viewport-container">
               <SearchPlayground onResultClick={handleResultClick} />
          </div>
        )}

        {currentView === 'chat' && (
          <div className="viewport-container">
            {videoUrl ? (
              <Chat
                videoUrl={videoUrl}
                videoId={docId || ''}
                ytId={ytId || ''}
                onExportToStudy={(c) => { setStudyContext(c); setCurrentView('study'); }}
              />
            ) : (
                <div className="empty-bauhaus bauhaus-border">
                    <h2 className="heading-lg">NO SOURCE LOADED</h2>
                    <p>PLEASE LOAD A VIDEO SOURCE OR USE DISCOVERY MODE.</p>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem' }}>
                        <button className="btn-bauhaus btn-red" onClick={() => setCurrentView('landing')}>GOTO START</button>
                        <button className="btn-bauhaus btn-yellow" onClick={() => setCurrentView('playground')}>GOTO EXPLORE</button>
                    </div>
                </div>
            )}
          </div>
        )}

        {currentView === 'dataflow' && <Dataflow onBack={() => setCurrentView('landing')} />}
        {currentView === 'contact' && <ContactPage onBack={() => setCurrentView('landing')} />}
        {currentView === 'study' && <StudyChat initialContext={studyContext} onBack={() => setCurrentView('chat')} />}
      </main>

      <style>{`
        .bauhaus-root {
          display: grid;
          grid-template-columns: 320px 1fr;
          height: 100vh;
          width: 100vw;
          background: #F0F0F0;
          overflow: hidden;
        }

        /* NAVIGATION */
        .bauhaus-nav {
          background: white;
          border-right: 4px solid black;
          display: flex;
          flex-direction: column;
          z-index: 10;
        }

        .brand-logo {
          padding: 3rem 2rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          border-bottom: 4px solid black;
          background: white;
        }
        
        .logo-text { font-weight: 900; font-size: 1.5rem; letter-spacing: -0.05em; margin-left: 0.5rem; }

        .nav-links { flex-grow: 1; padding: 2rem 0; }
        
        .nav-btn {
          width: 100%;
          border: none;
          background: transparent;
          text-align: left;
          padding: 1.5rem 2rem;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          transition: all 0.2s;
          border-bottom: 2px solid transparent;
        }

        .nav-btn:hover { background: #fdfdfd; padding-left: 2.5rem; }
        .nav-btn.active {
          background: var(--accent-color);
          color: white;
          border-bottom: 4px solid black;
        }
        
        .btn-index { font-weight: 900; font-size: 0.8rem; margin-bottom: 0.2rem; }
        .btn-label { font-weight: 900; font-size: 1.5rem; text-transform: uppercase; }

        .nav-footer { padding: 2rem; border-top: 4px solid black; font-weight: 900; font-size: 0.8rem; }

        /* VIEWPORT */
        .bauhaus-viewport {
          height: 100%;
          overflow-y: auto;
          position: relative;
        }

        .viewport-container { padding: 3rem; height: 100%; }

        .empty-bauhaus {
          background: white;
          padding: 4rem;
          max-width: 600px;
          margin: 0 auto;
          text-align: center;
          box-shadow: 12px 12px 0px 0px #121212;
        }

        @media (max-width: 900px) {
          .bauhaus-root { grid-template-columns: 1fr; }
          .bauhaus-nav { height: auto; border-bottom: 4px solid black; border-right: none; }
          .nav-links { display: flex; padding: 0; }
          .nav-btn { padding: 1rem; align-items: center; }
        }
      `}</style>
    </div>
  );
};

export default App;