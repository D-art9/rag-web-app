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
  const [isZooming, setIsZooming] = useState(false);
  const [studyContext, setStudyContext] = useState<string>('');

  const handleUrlSubmit = (url: string, id: string) => {
    setIsZooming(true);
    setVideoUrl(url);
    setVideoId(id);

    setTimeout(() => {
      setCurrentView('chat');
      setIsZooming(false);
    }, 800);
  };

  const handleNavigate = (view: View) => {
    setCurrentView(view);
  };

  const handleExportToStudy = (content: string) => {
    setStudyContext(content);
    setCurrentView('study');
  };

  // Sidebar Items based on your reference image
  const navItems = [
    { id: 'landing', label: 'Home', icon: '🏠' },
    { id: 'chat', label: 'Dashboard', icon: '📊' },
    { id: 'study', label: 'AI Study', icon: '🧠' },
    { id: 'dataflow', label: 'Tech Stack', icon: '⚙️' },
    { id: 'contact', label: 'Support', icon: '📞' },
  ];

  return (
    <div className="app-root">
      {/* GLOBAL BACKGROUND */}
      <div className="aurora-bg" />

      {/* SIDEBAR NAVIGATION - GLASS EFFECT */}
      <nav className="glass-panel sidebar">
        <div className="sidebar-logo">
          <span className="logo-icon">💠</span>
          <span className="logo-text">ScriptYT</span>
        </div>
        
        <div className="nav-menu">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${currentView === item.id ? 'active' : ''}`}
              onClick={() => handleNavigate(item.id as View)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </button>
          ))}
        </div>

        <div className="sidebar-footer">
          <div className="profile-badge glass-card">
            <div className="avatar">👤</div>
            <div className="profile-info">
              <p className="name">User</p>
              <p className="status">Free Account</p>
            </div>
          </div>
        </div>
      </nav>

      <main className="main-content">
        {currentView === 'landing' && (
          <div className={`view-container ${isZooming ? 'zoom-out-exit' : ''}`}>
            <LandingPage onUrlSubmit={handleUrlSubmit} onNavigate={handleNavigate} />
          </div>
        )}

        {currentView === 'dataflow' && (
          <div className="view-container">
            <Dataflow onBack={() => setCurrentView('landing')} />
          </div>
        )}

        {currentView === 'contact' && (
          <div className="view-container">
            <ContactPage onBack={() => setCurrentView('landing')} />
          </div>
        )}

        {currentView === 'chat' && (
          <div className="view-container">
            {videoUrl ? (
              <Chat
                videoUrl={videoUrl}
                videoId={videoId || ''}
                onExportToStudy={handleExportToStudy}
              />
            ) : (
                <div className="empty-state glass-panel">
                    <h2>No Video Selected</h2>
                    <p>Go to the Home page to analyze your first YouTube video!</p>
                    <button className="primary-btn" onClick={() => setCurrentView('landing')}>Go to Home</button>
                </div>
            )}
          </div>
        )}

        {currentView === 'study' && (
          <div className="view-container">
            <StudyChat
              initialContext={studyContext}
              onBack={() => setCurrentView('chat')}
            />
          </div>
        )}
      </main>

      <style>{`
        .app-root {
          display: flex;
          height: 100vh;
          width: 100vw;
          overflow: hidden;
        }

        .sidebar {
          width: var(--sidebar-width);
          height: 100%;
          padding: 2rem 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 2rem;
          border-right: 1px solid var(--glass-border);
          flex-shrink: 0;
        }

        .logo-text {
          font-weight: 700;
          font-size: 1.5rem;
          background: linear-gradient(90deg, #fff, var(--accent-primary));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-left: 0.5rem;
        }

        .nav-menu {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          flex-grow: 1;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.8rem 1rem;
          background: transparent;
          border: none;
          color: var(--text-secondary);
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
          width: 100%;
          text-align: left;
        }

        .nav-item:hover, .nav-item.active {
          background: rgba(255, 255, 255, 0.05);
          color: #fff;
        }

        .nav-item.active {
          border-left: 3px solid var(--accent-primary);
        }

        .main-content {
          flex-grow: 1;
          height: 100%;
          overflow-y: auto;
          position: relative;
          padding: 2rem;
        }

        .view-container {
          width: 100%;
          max-width: 1400px;
          margin: 0 auto;
          height: 100%;
        }

        .profile-badge {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.8rem;
        }

        .avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: var(--accent-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .profile-info .name { font-weight: 600; font-size: 0.9rem; }
        .profile-info .status { font-size: 0.75rem; color: var(--text-secondary); }

        .empty-state {
            padding: 4rem;
            text-align: center;
            border-radius: var(--radius-lg);
            margin-top: 10vh;
        }
        
        .primary-btn {
            margin-top: 1.5rem;
            padding: 0.8rem 2rem;
            background: var(--accent-primary);
            border: none;
            border-radius: 12px;
            color: #000;
            font-weight: 600;
            cursor: pointer;
        }
      `}</style>
    </div>
  );
};

export default App;