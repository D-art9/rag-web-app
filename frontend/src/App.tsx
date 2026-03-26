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
  const [docId, setDocId] = useState<string | null>(null); // Database ID
  const [ytId, setYtId] = useState<string | null>(null);   // YouTube Thumbnail ID
  const [currentView, setCurrentView] = useState<View>('landing');
  const [studyContext, setStudyContext] = useState<string>('');

  const handleUrlSubmit = (url: string, id: string) => {
    // Extract actual YouTube ID for UI/Thumbnails
    let youtubeId = '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
        youtubeId = match[2];
    }

    setVideoUrl(url);
    setDocId(id);       // Use this for sendMessage
    setYtId(youtubeId); // Use this for thumbnail
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
      <div className="crt-overlay" />
      <nav className="pane nav-pane">
        <div className="pane-header"><span>MULTIPLEXER_v1.0.0</span><span>[X]</span></div>
        <div className="shell-logo">
          <pre style={{ fontSize: '0.4rem', color: 'var(--primary-color)' }}>{`
   ____ ____ ____ ____ ____ 
  | S || C || R || Y || P |
  |____|____|____|____|____|
  | T || Y || T ||   ||   |
  |____|____|____|____|____| `}</pre>
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
        <div className="shell-status"><span>CONN: [OK]</span> | <span>USER: devan</span></div>
      </nav>

      <main className="shell-main">
        {currentView === 'landing' && (
          <div className="pane view-pane">
            <div className="pane-header"><span>SCRIPTYT: /root/home</span></div>
            <LandingPage onUrlSubmit={handleUrlSubmit} onNavigate={(v: any) => setCurrentView(v)} />
          </div>
        )}

        {currentView === 'chat' && (
          <div className="pane view-pane">
            <div className="pane-header"><span>SCRIPTYT: /root/dashboard</span></div>
            {videoUrl ? (
              <Chat
                videoUrl={videoUrl}
                videoId={docId || ''}
                ytId={ytId || ''}
                onExportToStudy={(c) => { setStudyContext(c); setCurrentView('study'); }}
              />
            ) : (
                <div style={{ padding: '2rem' }}><p>NO_SOURCE_FOUND. RETURN TO HOME.</p></div>
            )}
          </div>
        )}

        {currentView === 'dataflow' && <Dataflow onBack={() => setCurrentView('landing')} />}
        {currentView === 'contact' && <ContactPage onBack={() => setCurrentView('landing')} />}
        {currentView === 'study' && <StudyChat initialContext={studyContext} onBack={() => setCurrentView('chat')} />}
      </main>

      <style>{`
        .terminal-root { display: flex; height: 100vh; background: var(--bg-color); padding: 1rem; gap: 1rem; }
        .nav-pane { width: 220px; flex-shrink: 0; }
        .shell-menu { flex-grow: 1; padding: 1rem 0; }
        .shell-item { width: 100%; border: none; background: transparent; color: var(--primary-color); padding: 0.8rem; text-align: left; }
        .shell-item:hover, .shell-item.active { background: var(--primary-color); color: var(--bg-color); }
        .shell-main { flex-grow: 1; display: flex; flex-direction: column; }
        .view-pane { height: 100%; display: flex; flex-direction: column; }
      `}</style>
    </div>
  );
};

export default App;