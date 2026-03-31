import React, { useState } from 'react';
import { ArrowRight, Circle, Square, Triangle, Activity, Zap, Cpu, X } from 'lucide-react';

interface HeroLandingProps {
    onOpenAnalyzer: () => void;
}

type Panel = 'features' | 'tech' | 'api' | null;

const HeroLanding: React.FC<HeroLandingProps> = ({ onOpenAnalyzer }) => {
    const [activePanel, setActivePanel] = useState<Panel>(null);

    const togglePanel = (panel: Panel) => {
        setActivePanel(prev => prev === panel ? null : panel);
    };

    return (
        <div className="hero-landing-v4">
            <div className="bauhaus-bg-grid"></div>

            {/* NAV */}
            <nav className="hero-nav-bar bauhaus-border">
                <div className="hero-logo">
                    <div className="logo-shapes">
                        <Circle size={14} fill="var(--primary-red)" />
                        <Square size={14} fill="var(--primary-blue)" />
                        <Triangle size={14} fill="var(--primary-yellow)" />
                    </div>
                    <span className="logo-label">SCRIPTYT_CORE</span>
                </div>
                <div className="nav-links-hero">
                    <span className={`h-link ${activePanel === 'features' ? 'h-link-active' : ''}`} onClick={() => togglePanel('features')}>FEATURES</span>
                    <span className={`h-link ${activePanel === 'tech' ? 'h-link-active' : ''}`} onClick={() => togglePanel('tech')}>TECH_STACK</span>
                    <span className={`h-link ${activePanel === 'api' ? 'h-link-active' : ''}`} onClick={() => togglePanel('api')}>API_DOCS</span>
                </div>
                <button className="btn-nav-cta bg-red" onClick={onOpenAnalyzer}>LAUNCH_TERMINAL</button>
            </nav>

            {/* SLIDE-DOWN INFO PANELS */}
            {activePanel && (
                <div className="info-panel bauhaus-border">
                    <button className="panel-close" onClick={() => setActivePanel(null)}><X size={16} /></button>

                    {activePanel === 'features' && (
                        <div className="panel-grid">
                            {[
                                { icon: '🧬', title: 'MULTIMODAL_RAG', desc: 'Combines transcript text + visual thumbnail analysis for 2x context accuracy.' },
                                { icon: '⚡', title: 'REAL_TIME_STREAM', desc: 'Answers stream token-by-token via Server-Sent Events. Zero waiting.' },
                                { icon: '📼', title: 'VIDEO_HISTORY', desc: 'All analyzed videos stored in MongoDB. Resume any session instantly.' },
                                { icon: '🗺', title: 'SYSTEM_SCHEMATIC', desc: 'Live Dataflow map showing your full pipeline from ingestion to response.' },
                            ].map((f, i) => (
                                <div key={i} className="feature-card bauhaus-border">
                                    <div className="f-icon">{f.icon}</div>
                                    <div className="f-title">{f.title}</div>
                                    <div className="f-desc">{f.desc}</div>
                                </div>
                            ))}
                        </div>
                    )}

                    {activePanel === 'tech' && (
                        <table className="tech-table">
                            <thead><tr><th>LAYER</th><th>TECHNOLOGY</th><th>PURPOSE</th></tr></thead>
                            <tbody>
                                {[
                                    ['FRONTEND', 'React + TypeScript', 'Dark Industrial SPA with streaming UI'],
                                    ['BACKEND', 'Node.js / Express', 'REST API + SSE streaming endpoint'],
                                    ['AI_CORE', 'Gemini 2.5 Flash', 'Chat + Vision + Embedding generation'],
                                    ['VECTOR_DB', 'Pinecone', '1536-dim semantic search at scale'],
                                    ['DATABASE', 'MongoDB Atlas', 'Document storage & video history'],
                                    ['EXTRACTOR', 'Python + yt-dlp', 'YouTube transcript & metadata bridge'],
                                    ['TUNNEL', 'Localtunnel', 'Exposes local extractor to cloud backend'],
                                ].map(([layer, tech, purpose], i) => (
                                    <tr key={i}>
                                        <td className="td-layer">{layer}</td>
                                        <td className="td-tech">{tech}</td>
                                        <td className="td-desc">{purpose}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}

                    {activePanel === 'api' && (
                        <table className="tech-table">
                            <thead><tr><th>METHOD</th><th>ENDPOINT</th><th>DESCRIPTION</th></tr></thead>
                            <tbody>
                                {[
                                    ['POST', '/api/documents', 'Upload a YouTube URL — triggers full ingestion pipeline'],
                                    ['GET', '/api/documents', 'List all previously analyzed videos with metadata'],
                                    ['DELETE', '/api/documents/:id', 'Remove a video and its vector embeddings'],
                                    ['POST', '/api/chat/stream', 'Stream an AI response via SSE for a given videoId'],
                                ].map(([method, endpoint, desc], i) => (
                                    <tr key={i}>
                                        <td className={`td-method method-${method.toLowerCase()}`}>{method}</td>
                                        <td className="td-tech" style={{ fontFamily: 'monospace' }}>{endpoint}</td>
                                        <td className="td-desc">{desc}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}

            {/* HERO SECTION */}
            <header className="hero-main-content">
                <div className="hero-text-side">
                    <div className="hero-tag">[ NEXT_GEN_MULTIMODAL_RAG ]</div>
                    <h1 className="hero-headline">REVOLUTIONIZE_VIDEO_INTELLIGENCE.</h1>
                    <p className="hero-subline">
                        A CONSTRUCTIVIST ARCHITECTURE DESIGNED TO EXTRACT SEMANTIC KNOWLEDGE FROM TRANSCRIPTS AND VISION STREAMS SIMULTANEOUSLY.
                    </p>
                    <div className="hero-cta-group">
                        <button className="btn-bauhaus btn-red bauhaus-shadow-sm" onClick={onOpenAnalyzer}>
                            OPEN_SYSTEM_EXPLORER <ArrowRight size={20} />
                        </button>
                        <div className="status-indicator">
                            <div className="pulse-circle"></div>
                            <span>CONNECTED: GEMINI_2.5</span>
                        </div>
                    </div>
                </div>

                <div className="hero-orbital-wrapper">
                    <div className="orbital-canvas">
                        <div className="core-node bauhaus-border">
                            <Circle size={40} fill="var(--primary-red)" stroke="black" strokeWidth={3} />
                            <span className="core-label">AI_CORE</span>
                        </div>
                        <div className="orbit orbit-1">
                            <div className="orbit-item node-blue bauhaus-border"><Activity size={24} /></div>
                        </div>
                        <div className="orbit orbit-2">
                            <div className="orbit-item node-yellow bauhaus-border"><Zap size={24} /></div>
                        </div>
                        <div className="orbit orbit-3">
                            <div className="orbit-item node-white bauhaus-border"><Cpu size={24} /></div>
                        </div>
                    </div>
                </div>
            </header>

            {/* DEMO VIDEO SECTION */}
            <section className="demo-section">
                <div className="demo-header">
                    <h2 className="heading-sm">SYSTEM_RUN_THROUGH</h2>
                    <div className="divider-line"></div>
                </div>
                <div className="video-viewport bauhaus-border bauhaus-shadow">
                    <video
                        src="/demo.mp4"
                        controls
                        loop
                        playsInline
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', position: 'absolute', top: 0, left: 0 }}
                    />
                </div>
            </section>

            {/* BOTTOM CARDS — removed WORKSPACE, replaced with VIDEO_HISTORY */}
            <section className="hero-nav-blocks">
                <div className="h-card bg-blue bauhaus-border bauhaus-shadow-sm" onClick={onOpenAnalyzer} style={{ cursor: 'pointer' }}>
                    <div className="h-card-idx">01</div>
                    <div className="h-card-label">START_ANALYZER</div>
                </div>
                <div className="h-card bg-yellow bauhaus-border bauhaus-shadow-sm">
                    <div className="h-card-idx">02</div>
                    <div className="h-card-label">VIDEO_HISTORY</div>
                </div>
                <div className="h-card bg-white bauhaus-border bauhaus-shadow-sm" onClick={() => togglePanel('api')} style={{ cursor: 'pointer' }}>
                    <div className="h-card-idx">03</div>
                    <div className="h-card-label">API_REFERENCE</div>
                </div>
            </section>

            <style>{`
                .hero-landing-v4 {
                    background: var(--bg-color); color: var(--foreground);
                    min-height: 100vh; overflow-x: hidden; position: relative;
                    padding-bottom: 8rem;
                }
                .hero-nav-bar {
                    margin: 2rem; background: var(--pane-bg); padding: 0.8rem 2rem;
                    display: grid; grid-template-columns: 200px 1fr 200px; align-items: center;
                    position: sticky; top: 2rem; z-index: 200;
                }
                .hero-logo { display:flex; align-items:center; gap:0.5rem; font-weight:900; }
                .nav-links-hero { display:flex; justify-content:center; gap:3rem; font-weight:900; font-size:0.7rem; }
                .h-link { cursor:pointer; opacity:0.6; transition:0.2s; user-select: none; }
                .h-link:hover { opacity:1; color: var(--primary-red); }
                .h-link-active { opacity: 1 !important; color: var(--primary-red) !important; border-bottom: 2px solid var(--primary-red); }
                .btn-nav-cta { padding: 0.6rem 1rem; border: 3px solid black; font-weight: 900; cursor: pointer; font-size: 0.7rem; text-align:center; }

                /* INFO PANEL */
                .info-panel {
                    margin: 0 2rem 0.5rem; background: var(--pane-bg);
                    padding: 2rem; position: relative; z-index: 190;
                    animation: panel-drop 0.25s ease-out;
                }
                @keyframes panel-drop { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
                .panel-close {
                    position: absolute; top: 1rem; right: 1rem; background: none; border: none;
                    cursor: pointer; opacity: 0.5;
                }
                .panel-close:hover { opacity: 1; }
                .panel-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.5rem; }
                .feature-card { padding: 1.5rem; background: white; }
                .f-icon { font-size: 2rem; margin-bottom: 0.75rem; }
                .f-title { font-weight: 900; font-size: 0.75rem; letter-spacing: 0.1em; margin-bottom: 0.5rem; color: var(--primary-red); }
                .f-desc { font-size: 0.85rem; line-height: 1.5; opacity: 0.7; }

                /* TABLE */
                .tech-table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
                .tech-table th { text-align: left; font-weight: 900; font-size: 0.65rem; letter-spacing: 0.15em; opacity: 0.5; padding: 0.5rem 1rem 1rem; border-bottom: 2px solid black; }
                .tech-table td { padding: 0.9rem 1rem; border-bottom: 1px solid rgba(0,0,0,0.08); }
                .td-layer { font-weight: 900; font-size: 0.7rem; letter-spacing: 0.1em; opacity: 0.6; width: 150px; }
                .td-tech { font-weight: 700; width: 240px; }
                .td-desc { opacity: 0.7; }
                .td-method { font-weight: 900; font-size: 0.7rem; letter-spacing: 0.1em; width: 80px; }
                .method-post { color: var(--primary-blue); }
                .method-get { color: #16a34a; }
                .method-delete { color: var(--primary-red); }

                /* HERO */
                .hero-main-content { max-width: 1400px; margin: 0 auto; padding: 4rem 2rem; display: grid; grid-template-columns: 1.2fr 1fr; gap: 2rem; align-items: center; }
                .hero-headline { font-weight: 900; font-size: 4.5rem; line-height: 0.95; letter-spacing: -0.05em; margin: 0; max-width: 100%; word-wrap: break-word; }
                .hero-subline { font-weight: 500; font-size: 1.1rem; margin: 2rem 0; opacity: 0.7; max-width: 500px; line-height: 1.4; }
                .hero-cta-group { display: flex; align-items: center; gap: 2rem; }
                .btn-bauhaus { padding: 1.2rem 2rem; font-weight: 900; display: flex; align-items: center; gap: 1rem; cursor: pointer; border: none; }
                .hero-tag { font-size: 0.75rem; font-weight: 900; letter-spacing: 0.15em; opacity: 0.6; margin-bottom: 1.5rem; }
                .status-indicator { display: flex; align-items: center; gap: 0.75rem; font-weight: 900; font-size: 0.75rem; opacity: 0.7; }
                .pulse-circle { width: 10px; height: 10px; border-radius: 50%; background: #16a34a; animation: pulse-anim 1.5s infinite; }
                @keyframes pulse-anim { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.4; transform: scale(1.5); } }

                /* ORBITAL */
                .hero-orbital-wrapper { position: relative; height: 500px; display:flex; align-items:center; justify-content:center; }
                .orbital-canvas { position: relative; }
                .core-node { padding: 2rem; background: var(--pane-bg); z-index: 10; display: flex; flex-direction: column; align-items: center; }
                .core-label { font-weight: 900; font-size: 0.7rem; margin-top: 0.5rem; letter-spacing: 0.1em; }
                .orbit { position: absolute; border: 2px dashed rgba(0,0,0,0.1); border-radius: 50%; top: 50%; left: 50%; transform: translate(-50%, -50%); }
                .orbit-1 { width: 300px; height: 300px; animation: r 20s infinite linear; }
                .orbit-2 { width: 450px; height: 450px; animation: r 30s infinite linear reverse; }
                .orbit-3 { width: 600px; height: 600px; animation: r 45s infinite linear; }
                @keyframes r { from { transform: translate(-50%, -50%) rotate(0deg); } to { transform: translate(-50%, -50%) rotate(360deg); } }
                .orbit-item { position: absolute; top:0; left: 50%; transform: translateX(-50%); padding: 0.8rem; background: var(--pane-bg); }

                /* DEMO */
                .demo-section { max-width: 1100px; margin: 2rem auto; padding: 0 2rem; }
                .demo-header { display: flex; align-items: center; gap: 1.5rem; margin-bottom: 1.5rem; }
                .heading-sm { font-weight: 900; font-size: 0.75rem; letter-spacing: 0.2em; margin: 0; }
                .divider-line { flex: 1; height: 2px; background: black; }
                .video-viewport { aspect-ratio: 16/9; background: #111; position: relative; overflow: hidden; }

                /* BOTTOM CARDS */
                .hero-nav-blocks { max-width: 1100px; margin: 4rem auto; padding: 0 2rem; display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 2rem; }
                .h-card { padding: 3rem 2rem; transition: transform 0.2s; }
                .h-card:hover { transform: translateY(-5px); }
                .h-card-idx { font-weight: 900; font-size: 1.2rem; opacity: 0.5; margin-bottom: 0.5rem; }
                .h-card-label { font-weight: 900; font-size: 1.5rem; line-height: 1; }

                @media (max-width: 1100px) {
                    .hero-main-content { grid-template-columns: 1fr; text-align: center; }
                    .hero-text-side { display: flex; flex-direction: column; align-items: center; }
                    .hero-headline { font-size: 3rem; }
                    .hero-nav-bar { grid-template-columns: 1fr 1fr; gap: 1rem; }
                    .nav-links-hero { display: none; }
                    .panel-grid { grid-template-columns: 1fr 1fr; }
                }

                .bg-blue { background: var(--primary-blue); color: white; }
                .bg-yellow { background: var(--primary-yellow); color: black; }
                .bg-white { background: white; color: black; }
                .bg-red { background: var(--primary-red); color: white; }
            `}</style>
        </div>
    );
};

export default HeroLanding;
