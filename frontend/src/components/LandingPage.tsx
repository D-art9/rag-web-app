import React, { useState } from 'react';
import { uploadDocument } from '../services/api';

interface LandingPageProps {
  onUrlSubmit: (url: string, id: string) => void;
  onNavigate: (view: 'landing' | 'chat' | 'dataflow' | 'contact') => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onUrlSubmit, onNavigate }) => {
  const [url, setUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setIsProcessing(true);
    setError(null);

    try {
      const response = await uploadDocument(url);
      onUrlSubmit(url, response.id);
    } catch (err) {
      const errorObj: any = err;
      setError(errorObj.response?.data?.message || 'Failed to analyze video. Please check the URL and try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="landing-container fade-in" style={styles.container}>
      <div className="mesh-bg"></div>

      <header style={styles.topBar}>
        <div style={styles.headerContent}>
          <div style={styles.logo}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
              <path d="M10 15l5.19-3L10 9v6m11.56-7.83c.13.47.22 1.1.28 1.9.07.8.1 1.49.1 2.09L22 12c0 2.19-.16 3.8-.44 4.83-.25.9-.83 1.48-1.73 1.73-.47.13-1.33.22-2.65.28-1.3.07-2.49.1-3.59.1L12 19c-4.19 0-6.8-.16-7.83-.44-.9-.25-1.48-.83-1.73-1.73-.13-.47-.22-1.1-.28-1.9-.07-.8-.1-1.49-.1-2.09L2 12c0-2.19.16-3.8.44-4.83.25-.9.83-1.48 1.73-1.73.47-.13 1.33-.22 2.65-.28 1.3-.07 2.49-.1 3.59-.1L12 5c4.19 0 6.8.16 7.83.44.9.25 1.48.83 1.73 1.73z" />
            </svg>
            <span style={styles.brand}>ScriptYT</span>
          </div>

          <div style={styles.navLinks}>
            <button onClick={() => onNavigate('landing')} style={styles.navLink}>Home</button>
            <button onClick={() => onNavigate('dataflow')} style={styles.navLinkAccent}>✨ Dataflow Magic</button>
            <a href="#about" style={styles.navLink}>About</a>
            <button onClick={() => onNavigate('contact')} style={styles.navLink}>Contact</button>
            <a href="https://github.com/D-art9" target="_blank" rel="noreferrer" style={styles.socialLink} title="GitHub">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
            </a>
          </div>
        </div>
      </header>

      <main style={styles.main}>
        {/* Hero Section */}
        <section style={styles.hero}>
          <div style={styles.heroLayout}>
            <div style={styles.heroText}>
              <div className="fade-in" style={styles.badge}>v2.0 Beta • Now with RAG-Optimized Search</div>
              <h1 className="slide-in" style={styles.title}>Your YouTube Library, <span style={{ color: 'var(--accent-color)' }}>Conversational.</span></h1>
              <p className="slide-in" style={{ ...styles.subtitle, animationDelay: '0.1s' }}>
                ScriptYT turns hours of video content into an interactive workspace. Query transcripts, generate summaries, and extract insights instantly.
              </p>

              <form onSubmit={handleSubmit} className="slide-in card-glow" style={{ ...styles.form, animationDelay: '0.2s' }}>
                <input
                  type="text"
                  placeholder="Paste any YouTube video URL..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  style={styles.input}
                />
                <button
                  type="submit"
                  style={{ ...styles.button, opacity: isProcessing ? 0.7 : 1 }}
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Processing...' : 'Analyze Video'}
                </button>
              </form>
              <p style={{
                fontSize: '0.85rem',
                color: 'var(--text-secondary)',
                marginTop: '1rem',
                textAlign: 'left',
                opacity: 0.8
              }}>
                <span style={{ color: 'var(--accent-color)', fontWeight: 'bold' }}>Note:</span> Only videos with enabled captions/subtitles are supported for analysis.
              </p>

              {error && (
                <div style={{ color: '#ff4d4d', fontSize: '0.9rem', marginTop: '1rem', fontWeight: 600 }}>
                  {error}
                </div>
              )}

              <div className="fade-in" style={{ ...styles.heroMetrics, animationDelay: '0.4s' }}>
                <div style={styles.metricItem}><strong>10,240+</strong> Videos Processed</div>
                <div style={styles.metricDivider}></div>
                <div style={styles.metricItem}><strong>98.4%</strong> Analysis Accuracy</div>
              </div>
            </div>

            <div className="floating bento-item glass-card hero-preview fade-in" style={{ ...styles.previewPane, animationDelay: '0.3s' }}>
              <div style={styles.previewHeader}>
                <div style={styles.dot}></div>
                <div style={styles.dot}></div>
                <div style={styles.dot}></div>
                <div style={styles.previewTitle}>scriptyt_chat_session</div>
              </div>
              <div style={styles.previewContent}>
                <div style={styles.mockMsgBot}>How can I help you understand this video?</div>
                <div style={styles.mockMsgUser}>Sumarize the main technical points...</div>
                <div style={styles.mockMsgBot}>Based on the transcript, the speaker highlights three core concepts: Distributed Systems, Raft Consensus, and...</div>
                <div style={styles.mockPulse}></div>
              </div>
            </div>
          </div>
        </section>

        {/* Bento Grid Features */}
        <section style={styles.section}>
          <div className="slide-in" style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Built for Deep Understanding</h2>
            <p style={styles.sectionSubtitle}>ScriptYT handles the heavy lifting so you can focus on the insights.</p>
          </div>

          <div className="bento-grid slide-in" style={{ animationDelay: '0.4s' }}>
            {/* Feature 1: Contextual Search (Large) */}
            <div className="glass-card bento-item bento-2x2 card-glow" style={styles.bentoContent}>
              <div className="accent-glow" style={{ top: -20, left: -20 }}></div>
              <h3 style={styles.bentoTitle}>Contextual Semantic Search</h3>
              <p style={styles.bentoDesc}>Our RAG pipeline doesn't just look for words; it understands the meaning. Ask complex questions and get answers mapped back to specific video timestamps.</p>
              <div style={styles.mockCode}>
                <code>query: "Why did they choose Rust for the backend?"</code><br />
                <code>timestamp: 12:44 - "We needed memory safety without GC..."</code>
              </div>
            </div>

            {/* Feature 2: High Speed (Small) */}
            <div className="glass-card bento-item bento-1x1 card-glow" style={styles.bentoContent}>
              <h3 style={styles.bentoTitle}>Powered by yt-dlp</h3>
              <p style={styles.bentoDesc}>Securely extracts transcripts from any YouTube video using the industry-standard tool, ensuring high reliability.</p>
            </div>

            {/* Feature 3: LLM Integration (Small) */}
            <div className="glass-card bento-item bento-1x1 card-glow" style={styles.bentoContent}>
              <h3 style={styles.bentoTitle}>GPT-4o Powered</h3>
              <p style={styles.bentoDesc}>Advanced reasoning for complex summary generation.</p>
            </div>

            {/* Feature 4: Progress (Wide) */}
            <div className="glass-card bento-item bento-2x1 card-glow" style={styles.bentoContentWide}>
              <div style={styles.bentoWideInner}>
                <div>
                  <h3 style={styles.bentoTitle}>Video Intelligence</h3>
                  <p style={styles.bentoDesc}>Automatically identifies speakers, technical jargon, and key segments.</p>
                </div>
                <div style={styles.mockStats}>
                  <div style={styles.statBar}><div style={{ ...styles.statFill, width: '80%' }}></div></div>
                  <div style={styles.statBar}><div style={{ ...styles.statFill, width: '45%' }}></div></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Technology Used Section (New) */}
        <section style={{ ...styles.section, marginTop: '4rem' }}>
          <div style={styles.sectionHeader}>
            <h2 style={{ ...styles.sectionTitle, fontSize: '2rem' }}>Built With Modern Tech</h2>
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '2rem',
              flexWrap: 'wrap',
              marginTop: '3rem',
              maxWidth: '1000px',
              margin: '3rem auto 0'
            }}>
              {[
                { name: 'React', icon: '⚛️', desc: 'Frontend UI' },
                { name: 'Node.js', icon: '🟩', desc: 'Backend API' },
                { name: 'Transformer.js', icon: '🤖', desc: 'Local Embeddings' },
                { name: 'yt-dlp', icon: '📺', desc: 'Extraction' },
                { name: 'Groq', icon: '⚡', desc: 'Llama 3 Inference' },
                { name: 'Vector Search', icon: '🔍', desc: 'Cosine Similarity' }
              ].map((tech, i) => (
                <div key={i} className="slide-in" style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '16px',
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  width: '140px',
                  animationDelay: `${i * 0.1}s`
                }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{tech.icon}</div>
                  <div style={{ fontWeight: 700, marginBottom: '0.2rem' }}>{tech.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{tech.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works (Expanded) */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Seamless Integration</h2>
          <div style={styles.stepsLayout}>
            {[
              { num: '01', icon: '🔗', title: 'Connect', desc: 'Paste any public or unlisted YouTube link. We support videos of any length.' },
              { num: '02', icon: '🧠', title: 'Process', desc: 'Our engine extracts the transcript, chunks the data, and stores it in our vector database.' },
              { num: '03', icon: '🗨️', title: 'Interact', desc: 'Open the Chat experience to ask anything. It\'s like having a private tutor for the video.' }
            ].map((step, i) => (
              <div key={i} className="slide-in" style={{ ...styles.stepItem, animationDelay: `${0.2 * i}s` }}>
                <div style={styles.stepBubble}>{step.icon}</div>
                <div style={styles.stepInfo}>
                  <span style={styles.stepNum}>{step.num}</span>
                  <h3 style={styles.stepTitle}>{step.title}</h3>
                  <p style={styles.stepDesc}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* About Section (Storytelling) */}
        <section id="about" style={{ ...styles.section, paddingTop: '4rem' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'left', padding: '0 2rem' }}>
            <h2 className="slide-in" style={{ ...styles.sectionTitle, fontSize: '2.5rem', marginBottom: '3rem', textAlign: 'center' }}>Behind the Code</h2>

            <div className="slide-in" style={{ animationDelay: '0.1s', marginBottom: '4rem' }}>
              <h3 style={styles.storyHeading}>The "Why"</h3>
              <p style={styles.storyText}>
                We live in an age of infinite video content but finite time. We found ourselves constantly watching 2-hour lectures just to find one specific concept. We realized that <strong>video is a black box</strong>—search engines see titles, but they don't see <em>ideas</em>. We built ScriptYT to break that box open.
              </p>
            </div>

            <div className="slide-in" style={{ animationDelay: '0.2s', marginBottom: '4rem' }}>
              <h3 style={styles.storyHeading}>The Challenge of "Good Enough"</h3>
              <p style={styles.storyText}>
                Building RAG is easy. Building <em>accurate</em> RAG is incredibly hard. Our biggest hurdle wasn't the code—it was the <strong>Signal-to-Noise Ratio</strong>.
                <br /><br />
                Early versions of ScriptYT were too eager, hallucinating answers when it couldn't find facts. We spent weeks tuning our <strong>Vector Confidence Threshold</strong> (settling on a precise 0.15) and optimizing our chunking strategy (800 chars) to ensure the AI knows exactly when to say "I don't know."
              </p>
            </div>

            <div className="slide-in" style={{ animationDelay: '0.3s', marginBottom: '4rem' }}>
              <h3 style={styles.storyHeading}>Architecture & Philosophy</h3>
              <p style={styles.storyText}>
                We chose a <strong>client-agnostic architecture</strong>. The backend is a fortress of logic—handling the messy work of <code>yt-dlp</code> extraction, vectorization, and cosine similarity—so the frontend can focus purely on the human experience.
                <br /><br />
                No complex panels. No dashboard clutter. Just you, the video, and the knowledge.
              </p>
            </div>

            <div className="fade-in" style={{ textAlign: 'center', marginTop: '4rem', opacity: 0.8 }}>
              <p style={{ fontStyle: 'italic', color: 'var(--text-secondary)' }}>Built with ❤️ for the curious.</p>
            </div>
          </div>
        </section>
      </main>

      <footer style={styles.footer}>
        <div style={styles.footerContent}>
          <div style={styles.footerBrandSection}>
            <span style={styles.footerBrand}>ScriptYT</span>
            <p style={styles.footerDesc}>The ultimate tool for researchers, developers, and students to unlock web video content.</p>
          </div>
          <div style={styles.footerLinksGrid}>
            <div style={styles.linksCol}>
              <h4>Product</h4>
              <a href="#features">Features</a>
              <button onClick={() => onNavigate('dataflow')} style={{ ...styles.LinkButton, textAlign: 'left' }}>Dataflow</button>
            </div>
            <div style={styles.linksCol}>
              <h4>Resources</h4>
              <a href="https://github.com/yt-dlp/yt-dlp" target="_blank" rel="noreferrer">yt-dlp</a>
              <a href="#about">About</a>
            </div>
          </div>
        </div>
        <div style={styles.copyrightBar}>
          <p>© 2026 ScriptYT Labs. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    position: 'relative',
    background: 'transparent',
  },
  topBar: {
    width: '100%',
    background: 'rgba(14, 70, 122, 0.95)',
    backdropFilter: 'blur(10px)',
    padding: '0.75rem 0',
    position: 'sticky',
    top: 0,
    zIndex: 1000,
    borderBottom: '1px solid rgba(255,255,255,0.1)',
  },
  headerContent: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '0 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  brand: {
    fontSize: '1.2rem',
    fontWeight: 800,
    color: 'white',
    letterSpacing: '-0.5px',
  },
  storyHeading: {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: 'white',
    marginBottom: '1rem',
    letterSpacing: '-0.5px',
  },
  storyText: {
    fontSize: '1.1rem',
    color: 'var(--text-secondary)',
    lineHeight: 1.8,
    margin: 0,
  },
  socialIcons: {
    display: 'flex',
    gap: '1rem',
  },
  navLinks: {
    display: 'flex',
    gap: '1.5rem',
    alignItems: 'center',
  },
  navLink: {
    color: 'rgba(255,255,255,0.8)',
    textDecoration: 'none',
    fontSize: '0.95rem',
    fontWeight: 500,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
    transition: 'color 0.2s',
  },
  navLinkAccent: {
    color: 'var(--accent-color)',
    textDecoration: 'none',
    fontSize: '0.95rem',
    fontWeight: 700,
    background: 'rgba(230, 57, 70, 0.1)',
    padding: '0.5rem 1rem',
    borderRadius: '100px',
    border: '1px solid rgba(230, 57, 70, 0.2)',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  LinkButton: {
    background: 'none',
    border: 'none',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    padding: 0,
    fontSize: 'inherit',
    fontFamily: 'inherit',
    textAlign: 'left',
    transition: 'color 0.2s',
  },
  socialLink: {
    color: 'white',
    opacity: 0.8,
  },
  main: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 2rem',
    width: '100%',
    position: 'relative',
  },
  hero: {
    minHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: '4rem 0',
  },
  heroLayout: {
    display: 'grid',
    gridTemplateColumns: '1.2fr 0.8fr',
    gap: '4rem',
    alignItems: 'center',
  },
  heroText: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
  },
  badge: {
    background: 'rgba(230, 57, 70, 0.1)',
    color: 'var(--accent-color)',
    padding: '0.5rem 1rem',
    borderRadius: '100px',
    fontSize: '0.85rem',
    fontWeight: 600,
    width: 'fit-content',
    border: '1px solid rgba(230, 57, 70, 0.2)',
  },
  title: {
    fontSize: '4.8rem',
    fontWeight: 900,
    lineHeight: 1.05,
    letterSpacing: '-2.5px',
    color: 'white',
    margin: 0,
  },
  subtitle: {
    fontSize: '1.4rem',
    color: 'var(--text-secondary)',
    lineHeight: 1.5,
    margin: 0,
  },
  form: {
    display: 'flex',
    gap: '0.75rem',
    padding: '0.5rem',
    background: 'rgba(255,255,255,0.03)',
    borderRadius: '16px',
    border: '1px solid rgba(255,255,255,0.1)',
    marginTop: '1rem',
  },
  input: {
    flex: 1,
    fontSize: '1.05rem',
    padding: '1.2rem 1.5rem',
    background: 'transparent',
    border: 'none',
  },
  button: {
    padding: '0 2rem',
    fontSize: '1rem',
    fontWeight: 700,
    borderRadius: '12px',
  },
  heroMetrics: {
    display: 'flex',
    gap: '2rem',
    marginTop: '1.5rem',
  },
  metricItem: {
    fontSize: '0.9rem',
    color: 'var(--text-secondary)',
  },
  metricDivider: {
    width: '1px',
    height: '20px',
    background: 'rgba(255,255,255,0.1)',
  },
  previewPane: {
    height: '500px',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    border: '1px solid rgba(255,255,255,0.1)',
    overflow: 'hidden',
    boxShadow: '0 30px 60px rgba(0,0,0,0.4)',
  },
  previewHeader: {
    padding: '1rem',
    background: 'rgba(255,255,255,0.05)',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
  },
  dot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.2)',
  },
  previewTitle: {
    marginLeft: 'auto',
    fontSize: '0.75rem',
    color: 'rgba(255,255,255,0.3)',
    fontFamily: 'monospace',
  },
  previewContent: {
    flex: 1,
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
    position: 'relative',
  },
  mockMsgBot: {
    background: 'rgba(255,255,255,0.08)',
    padding: '1rem',
    borderRadius: '12px 12px 12px 0',
    fontSize: '0.85rem',
    maxWidth: '85%',
    color: 'var(--text-primary)',
  },
  mockMsgUser: {
    background: 'var(--accent-color)',
    padding: '1rem',
    borderRadius: '12px 12px 0 12px',
    fontSize: '0.85rem',
    alignSelf: 'flex-end',
    maxWidth: '85%',
    color: 'white',
  },
  mockPulse: {
    position: 'absolute',
    bottom: '2rem',
    left: '1.5rem',
    width: '12px',
    height: '12px',
    background: 'var(--accent-color)',
    borderRadius: '50%',
    boxShadow: '0 0 10px var(--accent-color)',
    animation: 'pulse 2s infinite',
  },
  section: {
    padding: '8rem 0',
    borderTop: '1px solid rgba(255,255,255,0.05)',
  },
  sectionHeader: {
    marginBottom: '4rem',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: '3rem',
    fontWeight: 800,
    color: 'white',
    marginBottom: '1rem',
  },
  sectionSubtitle: {
    fontSize: '1.2rem',
    color: 'var(--text-secondary)',
    maxWidth: '600px',
    margin: '0 auto',
  },
  bentoContent: {
    padding: '2.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  bentoContentWide: {
    padding: '2.5rem',
    display: 'flex',
    alignItems: 'center',
  },
  bentoWideInner: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    width: '100%',
    gap: '2rem',
    alignItems: 'center',
  },
  bentoTitle: {
    fontSize: '1.4rem',
    fontWeight: 700,
    color: 'white',
    margin: 0,
  },
  bentoDesc: {
    color: 'var(--text-secondary)',
    fontSize: '0.95rem',
    lineHeight: 1.6,
  },
  mockCode: {
    background: 'black',
    padding: '1rem',
    borderRadius: '8px',
    fontFamily: 'monospace',
    fontSize: '0.75rem',
    color: '#00ff00',
    marginTop: 'auto',
  },
  mockStats: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  statBar: {
    height: '8px',
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  statFill: {
    height: '100%',
    background: 'var(--accent-color)',
  },
  stepsLayout: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '4rem',
    marginTop: '4rem',
  },
  stepItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  stepBubble: {
    width: '60px',
    height: '60px',
    background: 'rgba(255,255,255,0.03)',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.5rem',
    border: '1px solid rgba(255,255,255,0.1)',
  },
  stepInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  stepNum: {
    fontSize: '0.75rem',
    letterSpacing: '2px',
    color: 'var(--accent-color)',
    fontWeight: 800,
  },
  stepTitle: {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: 'white',
  },
  stepDesc: {
    color: 'var(--text-secondary)',
    lineHeight: 1.6,
  },
  footer: {
    background: 'rgba(0,0,0,0.3)',
    paddingTop: '6rem',
    borderTop: '1px solid rgba(255,255,255,0.05)',
  },
  footerContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 2rem 4rem 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    gap: '4rem',
  },
  footerBrandSection: {
    maxWidth: '400px',
  },
  footerBrand: {
    fontSize: '1.8rem',
    fontWeight: 900,
    color: 'white',
    display: 'block',
    marginBottom: '1rem',
  },
  footerDesc: {
    color: 'var(--text-secondary)',
    lineHeight: 1.6,
  },
  footerLinksGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '4rem',
  },
  linksCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  copyrightBar: {
    padding: '2rem 0',
    borderTop: '1px solid rgba(255,255,255,0.03)',
    textAlign: 'center',
    color: 'rgba(255,255,255,0.2)',
    fontSize: '0.8rem',
  }
};

export default LandingPage;
