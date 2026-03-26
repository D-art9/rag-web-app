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

  return (
    <div className="app-root">
      {currentView === 'landing' && (
        <div className={isZooming ? 'zoom-out-exit' : ''} style={{ width: '100%', height: '100%' }}>
          <LandingPage onUrlSubmit={handleUrlSubmit} onNavigate={handleNavigate} />
        </div>
      )}

      {currentView === 'dataflow' && (
        <Dataflow onBack={() => setCurrentView('landing')} />
      )}

      {currentView === 'contact' && (
        <ContactPage onBack={() => setCurrentView('landing')} />
      )}

      {currentView === 'chat' && videoUrl && (
        <div className="experience-container zoom-in-enter">
          <Chat
            videoUrl={videoUrl}
            videoId={videoId || ''}
            onSelectVideo={handleUrlSubmit}
            onExportToStudy={handleExportToStudy}
          />
          <button
            onClick={() => {
              setVideoUrl(null);
              setVideoId(null);
              setCurrentView('landing');
            }}
            style={styles.backButton}
            title="Back to Home"
          >
            ←
          </button>
        </div>
      )}

      {currentView === 'study' && (
        <div className="experience-container">
          <StudyChat
            initialContext={studyContext}
            onBack={() => setCurrentView('chat')}
          />
        </div>
      )}
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  backButton: {
    position: 'fixed',
    top: '1.5rem',
    left: '1.5rem',
    zIndex: 100,
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.05)',
    color: 'var(--text-secondary)',
    border: '1px solid var(--border-color)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.2rem',
    transition: 'all 0.2s ease',
    cursor: 'pointer',
  }
};

export default App;