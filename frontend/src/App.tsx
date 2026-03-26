import React, { useState } from 'react';
import LandingPage from './components/LandingPage';
import Chat from './components/Chat';
import Dataflow from './components/Dataflow';
import ContactPage from './components/ContactPage';
import StudyChat from './components/StudyChat';
import './index.css';

type View = 'landing' | 'chat' | 'dataflow' | 'contact' | 'study';

const App: React.FC = () => {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoId, setVideoId] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<View>('landing');
  const [studyContext, setStudyContext] = useState<string>('');

  const handleUrlSubmit = (url: string, id: string) => {
    setVideoUrl(url);
    setVideoId(id);
    setCurrentView('chat');
  };

  const navItems = [
    { id: 'landing', label: '01_HOME', icon: '~' },
    { id: 'chat', label: '02_DASHBOARD', icon: '>' },
    { id: 'study', label: '03_STUDY_AI', icon: '?' },
    { id: 'dataflow', label: '04_STACK', icon: '#' },
    { id: 'contact', label: '05_SUPPORT', icon: '@' },
  ];

  return (
    <div className="terminal-root">
      {/* THE CRT SCANLINE OVERLAY */}
      <div className="crt-overlay" />

      {/* TERMINAL SHELL NAVIGATION (NAV PANE) */}
      <nav className="pane nav-pane">
        <div className="pane-header">
          <span>MULTIPLEXER_v1.0.0</span>
          <span>[X]</span>
        </div>
        
        <div className="shell-logo">
          <pre style={{ fontSize: '0.4rem', color: 'var(--primary-color)' }}>{`
   ____ ____ ____ ____ ____ 
  | S || C || R || Y || P |
  |____|____|____|____|____|
  | T || Y || T ||   ||   |
  |____|____|____|____|____|
          `}</pre>
        </div>
        
        <div className="shell-menu">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`shell-item ${currentView === item.id ? 'active' : ''}`}
              onClick={() => setCurrentView(item.id as View)}
            >
              <span className="shell-icon">{item.icon}</span>
              <span className="shell-label">{item.label}</span>
            </button>
          ))}
        </div>

        <div className="shell-status">
          <div className="status-grid">
              <span>USER_ID: anonym</span>
              <span>CONN: [OK]</span>
              <span>MEM: 48kb</span>
          </div>
        </div>
      </nav>

      {/* MAIN VIEWPORT PANES */}
      <main className="shell-main">
        {currentView === 'landing' && (
          <div className="pane view-pane">
            <div className="pane-header">
              <span>SCRIPTYT: /root/home</span>
              <span>08:00 AM</span>
            </div>
            <LandingPage onUrlSubmit={handleUrlSubmit} onNavigate={(v: any) => setCurrentView(v)} />
          </div>
        )}

        {currentView === 'chat' && (
          <div className="pane view-pane">
            <div className="pane-header">
              <span>SCRIPTYT: /root/dashboard</span>
              <span>01:00 PM</span>
            </div>
            {videoUrl ? (
              <Chat
                videoUrl={videoUrl}
                videoId={videoId || ''}
                onExportToStudy={(c) => { setStudyContext(c); setCurrentView('study'); }}
              />
            ) : (
                <div className="empty-state pane">
                    <div className="pane-header">ERROR: [NO_SOURCE]</div>
                    <div style={{ padding: '2rem' }}>
                        <p>SOURCE_FILE_NOT_FOUND. PLEASE INITIATE SOURCE ANALYSIS ON /ROOT/HOME.</p>
                        <button className="term-btn" style={{ marginTop: '1rem' }} onClick={() => setCurrentView('landing')}>GOTO /ROOT/HOME</button>
                    </div>
                </div>
            )}
          </div>
        )}

        {currentView === 'dataflow' && <Dataflow onBack={() => setCurrentView('landing')} />}
        {currentView === 'contact' && <ContactPage onBack={() => setCurrentView('landing')} />}
        
        {currentView === 'study' && (
          <div className="pane view-pane">
            <div className="pane-header"><span>SCRIPTYT: /root/study_ai</span></div>
            <StudyChat initialContext={studyContext} onBack={() => setCurrentView('chat')} />
          </div>
        )}
      </main>

      <style>{`
        .terminal-root {
          display: flex;
          height: 100vh;
          width: 100vw;
          background: var(--bg-color);
          padding: 1rem;
          gap: 1rem;
        }

        .nav-pane {
          width: 220px;
          display: flex;
          flex-direction: column;
          flex-shrink: 0;
        }

        .shell-logo {
          padding: 1rem;
          text-align: center;
          border-bottom: 1px dashed var(--border-color);
        }

        .shell-menu {
          padding: 1rem 0;
          flex-grow: 1;
        }

        .shell-item {
          width: 100%;
          text-align: left;
          background: transparent;
          border: none;
          color: var(--primary-color);
          padding: 0.8rem 1rem;
          font-family: var(--font-mono);
          cursor: pointer;
          display: flex;
          gap: 0.8rem;
          transition: background 0.1s;
        }

        .shell-item:hover, .shell-item.active {
          background: var(--primary-color);
          color: var(--bg-color);
        }

        .shell-item.active {
          border-left: 4px solid var(--secondary-color);
        }

        .shell-status {
          padding: 1rem;
          border-top: 1px dashed var(--border-color);
          font-size: 0.6rem;
          color: var(--muted-color);
        }

        .status-grid {
          display: grid;
          gap: 0.2rem;
        }

        .shell-main {
          flex-grow: 1;
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        .view-pane {
          height: 100%;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        @media (max-width: 800px) {
          .terminal-root { flex-direction: column; padding: 0.5rem; }
          .nav-pane { width: 100%; height: auto; }
          .shell-logo { display: none; }
        }
      `}</style>
    </div>
  );
};

export default App;