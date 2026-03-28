import React, { useState } from 'react';
import LandingPage from './components/LandingPage';
import Chat from './components/Chat';
import SearchPlayground from './components/SearchPlayground';
import Dataflow from './components/Dataflow';
import ContactPage from './components/ContactPage';
import HeroLanding from './components/HeroLanding';
import { Circle, Square, Triangle, Menu, X, Sun, Moon } from 'lucide-react';
import './index.css';

type View = 'hero' | 'landing' | 'chat' | 'dataflow' | 'contact' | 'playground';

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
    { id: 'hero', label: '00_HOME', color: 'var(--primary-red)' },
    { id: 'landing', label: '01_START', color: 'var(--primary-red)' },
    { id: 'chat', label: '02_WORKSPACE', color: 'var(--primary-blue)' },
    { id: 'playground', label: '03_EXPLORE', color: 'var(--primary-yellow)' },
  ];

  return (
    <div className={`bauhaus-root ${isMobileMenuOpen ? 'menu-open' : ''} ${isDarkMode ? 'bauhaus-dark' : ''}`}>
      {/* MOBILE TRIGGER */}
      <button className="mobile-menu-trigger bauhaus-border" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
        {isMobileMenuOpen ? <X size={32}/> : <Menu size={32}/>}
      </button>

      {/* ASYMMETRIC NAVIGATION PANEL */}
      <nav className="bauhaus-nav bauhaus-border">
         <div className="brand-logo-home" onClick={() => setView('hero')}>
            <Circle className="logo-shape" fill="var(--primary-red)" color="transparent" size={30} />
            <Square className="logo-shape" fill="var(--primary-blue)" color="transparent" size={30} />
            <Triangle className="logo-shape" fill="var(--primary-yellow)" color="transparent" size={30} />
            <div className="logo-text">SCRIPTYT</div>
         </div>

         <div className="nav-links">
           {navItems.map((item) => (
             <button
               key={item.id}
               className={`nav-btn ${currentView === item.id ? 'active' : ''}`}
               onClick={() => setView(item.id as View)}
               style={{ '--accent-color': item.color } as any}
             >
               <span className="btn-index">{item.label.split('_')[0]}</span>
               <span className="btn-label">{item.label.split('_')[1]}</span>
             </button>
           ))}
         </div>

         {/* THEME TOGGLE FOOTER */}
         <div className="nav-footer">
            <button className="theme-toggle bauhaus-border bauhaus-shadow-sm" onClick={toggleTheme}>
                {isDarkMode ? <Sun size={18}/> : <Moon size={18}/>}
                <span>MODE: {isDarkMode ? 'CONSTRUCT' : 'BLUEPRINT'}</span>
            </button>
            <div className="status-badge">v2.1_CORE_ACTIVE</div>
         </div>
      </nav>

      {/* MAIN CONTENT CANVAS */}
      <main className="bauhaus-viewport">
        {currentView === 'hero' && (
           <HeroLanding onOpenAnalyzer={() => setView('landing')} />
        )}

        {currentView === 'landing' && (
          <LandingPage onUrlSubmit={handleUrlSubmit} onNavigate={(v: any) => setView(v)} />
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
              />
            ) : (
                <div className="empty-bauhaus bauhaus-border">
                    <h2 className="heading-lg">NO_SOURCE_FOUND</h2>
                    <p>SYSTEM_RECEPTORS_IDLE. PLEASE FEED A SOURCE OR DISCOVER VIA EXPLORE.</p>
                    <div className="composition-buttons" style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem' }}>
                        <button className="btn-bauhaus btn-red" onClick={() => setView('landing')}>GOTO_START</button>
                        <button className="btn-bauhaus btn-yellow" onClick={() => setView('playground')}>GOTO_EXPLORE</button>
                    </div>
                </div>
            )}
          </div>
        )}

        {currentView === 'dataflow' && <Dataflow onBack={() => setView('landing')} />}
        {currentView === 'contact' && <ContactPage onBack={() => setView('landing')} />}
      </main>

      <style>{`
        .bauhaus-root {
          display: grid;
          grid-template-columns: 320px 1fr;
          height: 100vh;
          width: 100vw;
          background: var(--bg-color);
          color: var(--foreground);
          overflow: hidden;
          position: relative;
        }

        /* NAVIGATION */
        .bauhaus-nav {
          background: var(--pane-bg);
          border-right: 4px solid var(--border-color);
          display: flex;
          flex-direction: column;
          z-index: 100;
          transition: transform 0.3s ease-in-out, background 0.4s ease;
        }

        .brand-logo-home {
          padding: 2.5rem 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          border-bottom: 4px solid var(--border-color);
          background: var(--pane-bg);
          cursor: pointer;
          transition: background 0.2s;
        }
        .brand-logo-home:hover { background: rgba(0,0,0,0.02); }
        .logo-shape { transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
        .brand-logo-home:hover .logo-shape { transform: scale(1.2); }
        
        .logo-text { font-weight: 900; font-size: 1.4rem; letter-spacing: -0.05em; margin-left: 0.5rem; }

        .nav-links { flex-grow: 1; padding: 1rem 0; }
        
        .nav-btn {
          width: 100%;
          border: none;
          background: transparent;
          text-align: left;
          padding: 1.2rem 2rem;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          color: var(--foreground);
          transition: all 0.2s;
          border-bottom: 2px solid transparent;
        }

        .nav-btn:hover { background: rgba(0,0,0,0.02); padding-left: 2.5rem; }
        .nav-btn.active {
          background: var(--accent-color);
          color: white;
          border-bottom: 4px solid var(--border-color);
        }
        
        .btn-index { font-weight: 900; font-size: 0.7rem; margin-bottom: 0.1rem; }
        .btn-label { font-weight: 900; font-size: 1.3rem; text-transform: uppercase; }

        .nav-footer { padding: 1.5rem; border-top: 4px solid var(--border-color); display: flex; flex-direction: column; gap: 1rem; }
        .status-badge { font-weight: 900; font-size: 0.7rem; color: var(--foreground); opacity: 0.5; }

        .theme-toggle {
            display: flex; align-items: center; gap: 0.5rem; 
            padding: 0.8rem 1rem; cursor: pointer;
            background: var(--pane-bg); color: var(--foreground);
            font-weight: 900; font-size: 0.7rem; text-transform: uppercase;
            transition: all 0.2s;
        }
        .theme-toggle:hover { background: var(--foreground); color: var(--pane-bg); }

        /* MOBILE OVERRIDES */
        .mobile-menu-trigger {
          display: none;
          position: absolute;
          top: 1rem; right: 1rem;
          background: var(--primary-red);
          color: white;
          padding: 0.5rem;
          z-index: 200;
        }

        /* VIEWPORT */
        .bauhaus-viewport {
          height: 100%;
          overflow-y: auto;
          position: relative;
        }

        .viewport-container { padding: 0; height: 100%; }

        .empty-bauhaus {
          background: var(--pane-bg);
          padding: 4rem 2rem;
          max-width: 650px;
          margin: 4rem auto;
          text-align: center;
          box-shadow: 12px 12px 0px 0px var(--border-color);
        }

        @media (max-width: 900px) {
          .bauhaus-root { grid-template-columns: 1fr; }
          .bauhaus-nav { 
             position: absolute; transform: translateX(-100%); 
             height: 100%; width: 280px; 
          }
          .bauhaus-root.menu-open .bauhaus-nav { transform: translateX(0); }
          .mobile-menu-trigger { display: flex; }
          .viewport-container { padding: 1rem; padding-top: 5rem; }
        }
      `}</style>
    </div>
  );
};

export default App;