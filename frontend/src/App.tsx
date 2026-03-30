import React, { useState } from 'react';
import LandingPage from './components/LandingPage';
import Chat from './components/Chat';
import Dataflow from './components/Dataflow';
import HeroLanding from './components/HeroLanding';
import HistoryPage from './components/HistoryPage';
import { Circle, Square, Triangle, Menu, X, Sun, Moon } from 'lucide-react';
import './index.css';

type View = 'hero' | 'landing' | 'chat' | 'history' | 'dataflow';

const App: React.FC = () => {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [docId, setDocId] = useState<string | null>(null);
  const [ytId, setYtId] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<View>('hero');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleTheme = () => setIsDarkMode(prev => !prev);

  const setView = (v: View) => {
    setCurrentView(v);
    setIsMobileMenuOpen(false);
  };

  const handleUrlSubmit = (url: string, id: string) => {
    let youtubeId = '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) youtubeId = match[2];

    setVideoUrl(url);
    setDocId(id);
    setYtId(youtubeId);
    setView('chat');
  };

  const handleResultClick = (id: string, url: string, title: string, thumb: string) => {
    let youtubeId = '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) youtubeId = match[2];

    setVideoUrl(url);
    setDocId(id);
    setYtId(youtubeId);
    setView('chat');
  };

  const navItems = [
    { id: 'hero', label: '00_HOME', color: 'var(--accent-red)' },
    { id: 'landing', label: '01_START', color: 'var(--accent-red)' },
    { id: 'chat', label: '02_WORKSPACE', color: 'var(--accent-blue)' },
    { id: 'history', label: '03_HISTORY', color: 'var(--accent-yellow)' },
    { id: 'dataflow', label: '04_DATAFLOW', color: 'var(--accent-cyan)' },
  ];

  return (
    <div className={`layout-root ${isMobileMenuOpen ? 'menu-open' : ''}`}>
      {/* 00_CORE_NAVIGATION */}
      <nav className="sidebar">
          <div className="brand-logo-home" onClick={() => setView('hero')} style={{ display: 'flex', gap: '8px', marginBottom: '40px', cursor: 'pointer' }}>
            <Circle fill="var(--accent-red)" color="transparent" size={12} />
            <Square fill="var(--accent-blue)" color="transparent" size={12} />
            <Triangle fill="var(--accent-yellow)" color="transparent" size={12} />
            <div style={{ fontWeight: 900, fontSize: '16px', letterSpacing: '0.1em' }}>SCRIPTYT</div>
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {navItems.map((item) => (
              <button
                key={item.id}
                className={`nav-btn-new ${currentView === item.id ? 'active' : ''}`}
                onClick={() => setView(item.id as View)}
                style={{
                    background: currentView === item.id ? 'rgba(255,255,255,0.05)' : 'transparent',
                    border: 'none', padding: '12px 16px', borderRadius: '4px', textAlign: 'left',
                    cursor: 'pointer', color: currentView === item.id ? 'white' : 'var(--text-muted)',
                    transition: '0.2s', display: 'flex', flexDirection: 'column'
                }}
              >
                <span style={{ fontSize: '9px', fontWeight: 900, opacity: 0.5 }}>{item.label.split('_')[0]}</span>
                <span style={{ fontSize: '14px', fontWeight: 900 }}>{item.label.split('_')[1]}</span>
              </button>
            ))}
          </div>

          <div style={{ marginTop: 'auto', borderTop: 'var(--glass-border)', paddingTop: '20px' }}>
             <div className="industrial-label" style={{ fontSize: '9px', opacity: 0.6 }}>SYSTEM_CORE_v2.1</div>
             <div className="industrial-label" style={{ fontSize: '9px', color: 'var(--accent-cyan)' }}>D_ART_ACTIVE</div>
          </div>
      </nav>

      {/* 01_APPLICATION_VIEWPORT */}
      <main className="workspace-container" style={{ background: 'var(--bg-core)' }}>
        {currentView === 'hero' && <HeroLanding onOpenAnalyzer={() => setView('landing')} />}
        {currentView === 'landing' && <LandingPage onUrlSubmit={handleUrlSubmit} onNavigate={(v: any) => setView(v)} />}
        {currentView === 'history' && <HistoryPage onSelectVideo={(id, url) => { setDocId(id); setVideoUrl(url); setView('chat'); }} />}
        {currentView === 'dataflow' && <Dataflow />}
        {currentView === 'chat' && (
          <div style={{ height: '100%', width: '100%' }}>
            {videoUrl ? (
              <Chat videoUrl={videoUrl} videoId={docId || ''} ytId={ytId || ''} />
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '20px' }}>
                    <div className="industrial-label">NO_OPERATIONAL_SOURCE</div>
                    <div className="glass-card" style={{ textAlign: 'center', maxWidth: '400px' }}>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Feed a YouTube DNA sequence into the analyzer to begin the Multimodal extraction.</p>
                        <button className="nav-btn-new" onClick={() => setView('landing')} style={{ background: 'var(--accent-blue)', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>INITIALIZE_START</button>
                    </div>
                </div>
            )}
          </div>
        )}
      </main>

    </div>
  );
};

export default App;