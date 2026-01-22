import React, { useState } from 'react';
import LandingPage from './components/LandingPage';
import Chat from './components/Chat';
import Dataflow from './components/Dataflow';
import ContactPage from './components/ContactPage';
import StudyChat from './components/StudyChat';

type View = 'landing' | 'chat' | 'dataflow' | 'contact' | 'study';

const App: React.FC = () => {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoId, setVideoId] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<View>('landing');
  const [isZooming, setIsZooming] = useState(false);
  const [studyContext, setStudyContext] = useState<string>('');

  const handleUrlSubmit = (url: string, id: string) => {
    // 1. Start Zoom Animation
    setIsZooming(true);
    setVideoUrl(url);
    setVideoId(id);

    // 2. Wait for animation, then switch view
    setTimeout(() => {
      setCurrentView('chat');
      setIsZooming(false);
    }, 800);
  };

  const handleNavigate = (view: View) => {
    setCurrentView(view);
    if (view !== 'chat') {
      // logic if needed
    }
  };

  const handleExportToStudy = (content: string) => {
    setStudyContext(content);
    setCurrentView('study');
  };

  return (
    <div className="app-root">
      {/* Landing Page with Zoom Exit Class */}
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

// Inject CSS for Zoom Transition
const styleSheet = document.createElement("style");
styleSheet.innerText = `
  @keyframes zoomOutExit {
    0% { transform: scale(1); opacity: 1; filter: blur(0px); }
    100% { transform: scale(1.5); opacity: 0; filter: blur(10px); }
  }
  @keyframes zoomInEnter {
    0% { transform: scale(0.95); opacity: 0; filter: blur(10px); }
    100% { transform: scale(1); opacity: 1; filter: blur(0px); }
  }
  .zoom-out-exit {
    animation: zoomOutExit 0.8s forwards cubic-bezier(0.22, 1, 0.36, 1);
    pointer-events: none;
  }
  .zoom-in-enter {
    animation: zoomInEnter 0.6s forwards cubic-bezier(0.22, 1, 0.36, 1);
  }
`;
document.head.appendChild(styleSheet);

export default App;