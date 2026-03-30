import React from 'react';
import { ArrowRight, Circle, Square, Triangle, Activity, Zap, Cpu } from 'lucide-react';

interface HeroLandingProps {
    onOpenAnalyzer: () => void;
}

const HeroLanding: React.FC<HeroLandingProps> = ({ onOpenAnalyzer }) => {
    return (
        <div className="hero-landing-v4">
            <div className="bauhaus-bg-grid"></div>

            {/* TOP NAVIGATION BAR */}
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
                    <span className="h-link">FEATURES</span>
                    <span className="h-link">TECH_STACK</span>
                    <span className="h-link">API_DOCS</span>
                </div>
                <button className="btn-nav-cta bg-red" onClick={onOpenAnalyzer}>LAUNCH_TERMINAL</button>
            </nav>

            {/* HERO SECTION: HEADLINE + ORBITAL */}
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
                            <span>CONNECTED: GEMINI_1.5</span>
                        </div>
                    </div>
                </div>

                {/* THE KINETIC ORBITAL DIAGRAM */}
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

            {/* THE VIDEO VIEWPORT SECTION */}
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
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            display: 'block',
                            position: 'absolute',
                            top: 0, left: 0
                        }}
                    />
                </div>
            </section>

            {/* REFINED BOTTOM CARDS */}
            <section className="hero-nav-blocks">
                <div className="h-card bg-blue bauhaus-border bauhaus-shadow-sm">
                    <div className="h-card-idx">01</div>
                    <div className="h-card-label">EXPLORE_LIBRARY</div>
                </div>
                <div className="h-card bg-yellow bauhaus-border bauhaus-shadow-sm">
                    <div className="h-card-idx">02</div>
                    <div className="h-card-label">DATA_FLOW_MAP</div>
                </div>
                <div className="h-card bg-white bauhaus-border bauhaus-shadow-sm">
                    <div className="h-card-idx">03</div>
                    <div className="h-card-label">CONTACT_CONTROL</div>
                </div>
            </section>

            <style>{`
                .hero-landing-v4 {
                    background: var(--bg-color); color: var(--foreground);
                    min-height: 100vh; overflow-x: hidden; position: relative;
                    padding-bottom: 8rem; transition: background 0.4s ease;
                }

                /* NAVBAR FIXes */
                .hero-nav-bar {
                    margin: 2rem; background: var(--pane-bg); padding: 0.8rem 2rem;
                    display: grid; grid-template-columns: 200px 1fr 200px; align-items: center;
                    position: sticky; top: 2rem; z-index: 100;
                }
                .hero-logo { display:flex; align-items:center; gap:0.5rem; font-weight:900; }
                .nav-links-hero { display:flex; justify-content:center; gap:3rem; font-weight:900; font-size:0.7rem; }
                .h-link { cursor:pointer; opacity:0.6; transition:0.2s; }
                .h-link:hover { opacity:1; color: var(--primary-red); }
                .btn-nav-cta { padding: 0.6rem 1rem; border: 3px solid black; font-weight: 900; cursor: pointer; font-size: 0.7rem; text-align:center; }

                /* HERO CONTENT */
                .hero-main-content {
                    max-width: 1400px; margin: 0 auto; padding: 4rem 2rem;
                    display: grid; grid-template-columns: 1.2fr 1fr; gap: 2rem; align-items: center;
                }
                .hero-headline { 
                    font-weight: 900; font-size: 4.5rem; line-height: 0.95; letter-spacing: -0.05em; 
                    margin: 0; max-width: 100%; word-wrap: break-word; 
                }
                .hero-subline { font-weight: 500; font-size: 1.1rem; margin: 2rem 0; opacity: 0.7; max-width: 500px; line-height: 1.4; }
                .hero-cta-group { display: flex; align-items: center; gap: 2rem; }
                
                .btn-bauhaus { padding: 1.2rem 2rem; font-weight: 900; display: flex; align-items: center; gap: 1rem; cursor: pointer; border: none; }

                /* ORBITAL FIXes */
                .hero-orbital-wrapper { position: relative; height: 500px; display:flex; align-items:center; justify-content:center; }
                .orbital-canvas { position: relative; }
                .core-node { padding: 2rem; background: var(--pane-bg); z-index: 10; display: flex; flex-direction: column; align-items: center; }
                
                .orbit { position: absolute; border: 2px dashed rgba(0,0,0,0.1); border-radius: 50%; top: 50%; left: 50%; transform: translate(-50%, -50%); }
                .orbit-1 { width: 300px; height: 300px; animation: r 20s infinite linear; }
                .orbit-2 { width: 450px; height: 450px; animation: r 30s infinite linear reverse; }
                .orbit-3 { width: 600px; height: 600px; animation: r 45s infinite linear; }
                @keyframes r { from { transform: translate(-50%, -50%) rotate(0deg); } to { transform: translate(-50%, -50%) rotate(360deg); } }

                .orbit-item { position: absolute; top:0; left: 50%; transform: translateX(-50%); padding: 0.8rem; background: var(--pane-bg); }

                /* DEMO FIXes */
                .demo-section { max-width: 1100px; margin: 2rem auto; padding: 0 2rem; }
                .video-viewport { aspect-ratio: 16/9; background: #111; position: relative; overflow: hidden; }

                /* BOTTOM CARDS FIXes */
                .hero-nav-blocks { 
                    max-width: 1100px; margin: 4rem auto; padding: 0 2rem;
                    display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 2rem; 
                }
                .h-card { padding: 3rem 2rem; cursor: pointer; transition: transform 0.2s; }
                .h-card:hover { transform: translateY(-5px); }
                .h-card-idx { font-weight: 900; font-size: 1.2rem; opacity: 0.5; margin-bottom: 0.5rem; }
                .h-card-label { font-weight: 900; font-size: 1.5rem; line-height: 1; }

                @media (max-width: 1100px) {
                    .hero-main-content { grid-template-columns: 1fr; text-align: center; }
                    .hero-text-side { display: flex; flex-direction: column; align-items: center; }
                    .hero-headline { font-size: 3rem; }
                    .hero-nav-bar { grid-template-columns: 1fr 1fr; gap: 1rem; }
                    .nav-links-hero { display: none; }
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
