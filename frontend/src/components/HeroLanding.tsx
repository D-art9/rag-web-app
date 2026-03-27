import React from 'react';
import { Play, ArrowRight, Circle, Square, Triangle, Activity, Zap, Cpu } from 'lucide-react';

interface HeroLandingProps {
    onOpenAnalyzer: () => void;
}

const HeroLanding: React.FC<HeroLandingProps> = ({ onOpenAnalyzer }) => {
    return (
        <div className="hero-landing-v3">
            <div className="bauhaus-bg-grid"></div>

            {/* TOP NAVIGATION BAR */}
            <nav className="hero-nav-bar bauhaus-border">
                <div className="hero-logo">
                    <div className="logo-shapes">
                        <Circle size={14} fill="var(--primary-red)" />
                        <Square size={14} fill="var(--primary-blue)" />
                        <Triangle size={14} fill="var(--primary-yellow)" />
                    </div>
                    <span>SCRIPTYT_CORE</span>
                </div>
                <div className="nav-links-hero">
                    <span>FEATURES</span>
                    <span>TECH_STACK</span>
                    <span>API_DOCS</span>
                    <button className="btn-nav-cta bg-red" onClick={onOpenAnalyzer}>LAUNCH_TERMINAL</button>
                </div>
            </nav>

            {/* HERO SECTION: HEADLINE + ORBITAL */}
            <header className="hero-main-content">
                <div className="hero-text-side">
                    <div className="hero-tag">[ NEXT_GEN_MULTIMODAL_RAG ]</div>
                    <h1 className="hero-headline">REVOLUTIONIZE_VIDEO_INTELLIGENCE.</h1>
                    <p className="hero-subline">
                        A CONSTRUCTIVIST ARCHITECTURE DESIGNED TO EXTRACT SEMANTIC KNOWLEDGE FROM TRANSCRIPTS AND VISION STREAMS SUMULTANEOUSLY.
                    </p>
                    <div className="hero-cta-group">
                        <button className="btn-bauhaus btn-red bauhaus-shadow-sm" onClick={onOpenAnalyzer}>
                            OPEN_SYTEM_EXPLORER <ArrowRight size={20} />
                        </button>
                        <div className="status-indicator">
                            <div className="pulse-circle"></div>
                            CONNECTED_TO: GEMINI_1.5_FLASH
                        </div>
                    </div>
                </div>

                {/* THE KINETIC ORBITAL DIAGRAM */}
                <div className="hero-orbital-side">
                    <div className="orbital-container">
                        <div className="core-node bauhaus-border">
                             <Circle size={40} fill="var(--primary-red)" stroke="black" strokeWidth={3} />
                             <span className="core-label">AI_CORE</span>
                        </div>
                        
                        <div className="orbit orbit-1">
                             <div className="orbit-item node-blue bauhaus-border">
                                <Activity size={24} />
                                <span className="item-label">AUDIO_STREAM</span>
                             </div>
                        </div>

                        <div className="orbit orbit-2">
                             <div className="orbit-item node-yellow bauhaus-border">
                                <Zap size={24} />
                                <span className="item-label">VISION_SYNC</span>
                             </div>
                        </div>

                        <div className="orbit orbit-3">
                             <div className="orbit-item node-white bauhaus-border" style={{ background: 'white', color: 'black' }}>
                                <Cpu size={24} />
                                <span className="item-label">VECTOR_HUB</span>
                             </div>
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
                    <div className="viewport-overlay">
                         <div className="play-button-bauhaus">
                            <Play size={40} fill="white" color="white" />
                         </div>
                         <div className="viewport-tag">SYSTEM_O_V_01.MP4</div>
                    </div>
                    {/* PLACEHOLDER FOR VIDEO */}
                    <div className="video-placeholder-bg"></div>
                </div>
                
                <div className="demo-footer">
                   <p>WATCH OUR ENGINE CONVERGE AUDIO AND VISION DATAFILES INTO REAL-TIME INSIGHTS.</p>
                </div>
            </section>

            <style>{`
                .hero-landing-v3 {
                    background: var(--bg-color); color: var(--foreground);
                    min-height: 100vh; overflow-x: hidden; position: relative;
                    padding-bottom: 8rem; transition: background 0.4s ease;
                }

                .hero-nav-bar {
                    margin: 2rem; background: var(--pane-bg); padding: 1rem 2rem;
                    display: flex; justify-content: space-between; align-items: center;
                    position: sticky; top: 2rem; z-index: 100;
                }
                .hero-logo { display: flex; align-items: center; gap: 1rem; font-weight: 900; letter-spacing: 0.1em; }
                .logo-shapes { display: flex; gap: 0.3rem; }
                .nav-links-hero { display: flex; align-items: center; gap: 3rem; font-weight: 900; font-size: 0.7rem; letter-spacing: 0.2em; }
                .btn-nav-cta { padding: 0.6rem 1.5rem; border: 2px solid black; font-weight: 900; cursor: pointer; }

                /* MAIN HERO */
                .hero-main-content {
                    max-width: 1400px; margin: 0 auto; padding: 6rem 2rem;
                    display: grid; grid-template-columns: 1.2fr 1fr; gap: 4rem; align-items: center;
                }

                .hero-tag { font-weight: 900; color: var(--primary-red); letter-spacing: 0.3em; margin-bottom: 1rem; }
                .hero-headline { font-weight: 900; font-size: 5.5rem; line-height: 0.95; letter-spacing: -0.05em; margin: 0; }
                .hero-subline { font-weight: 500; font-size: 1.3rem; margin: 2rem 0; opacity: 0.7; max-width: 550px; line-height: 1.4; }
                
                .hero-cta-group { display: flex; align-items: center; gap: 2rem; }
                .status-indicator { display: flex; align-items: center; gap: 0.5rem; font-weight: 900; font-size: 0.7rem; opacity: 0.6; }
                .pulse-circle { width: 10px; height: 10px; background: var(--primary-red); border-radius: 50%; animation: pulse 1.5s infinite; }
                @keyframes pulse { 0% { transform: scale(1); opacity: 1; } 100% { transform: scale(2.5); opacity: 0; } }

                /* ORBITAL */
                .hero-orbital-side { position: relative; height: 600px; display: flex; align-items: center; justify-content: center; }
                .orbital-container { position: relative; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; }
                
                .core-node { 
                    padding: 2.5rem; background: var(--pane-bg); z-index: 10;
                    display: flex; flex-direction: column; align-items: center; gap: 0.5rem;
                }
                .core-label { font-weight: 900; font-size: 0.7rem; letter-spacing: 0.1em; }

                .orbit { position: absolute; border: 2px dashed rgba(0,0,0,0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center; }
                .orbit-1 { width: 350px; height: 350px; animation: rotate-linear 20s infinite linear; }
                .orbit-2 { width: 500px; height: 500px; animation: rotate-linear 30s infinite linear reverse; }
                .orbit-3 { width: 650px; height: 650px; animation: rotate-linear 45s infinite linear; }

                .orbit-item {
                    position: absolute; top: 0; padding: 1rem; display: flex; flex-direction: column; align-items: center; gap: 0.5rem;
                    background: var(--pane-bg);
                }
                .node-blue { border-color: var(--primary-blue); color: var(--primary-blue); transform: rotate(0deg); }
                .node-yellow { border-color: var(--primary-yellow); color: var(--primary-yellow); }
                .item-label { font-weight: 900; font-size: 0.6rem; letter-spacing: 0.1em; color: black; }

                @keyframes rotate-linear { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

                /* DEMO SECTION */
                .demo-section { max-width: 1100px; margin: 4rem auto; padding: 0 2rem; }
                .demo-header { display: flex; align-items: center; gap: 2rem; margin-bottom: 3rem; }
                .divider-line { flex-grow: 1; height: 4px; background: black; opacity: 0.1; }

                .video-viewport {
                    aspect-ratio: 16/9; background: #000; position: relative; overflow: hidden;
                    cursor: pointer; transition: transform 0.3s;
                }
                .video-viewport:hover { transform: scale(1.02); }
                .video-placeholder-bg { width: 100%; height: 100%; background: #111; opacity: 0.5; }
                
                .viewport-overlay {
                    position: absolute; top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(0,0,0,0.4); display: flex; flex-direction: column; 
                    align-items: center; justify-content: center; z-index: 5;
                }
                .play-button-bauhaus {
                    width: 100px; height: 100px; border: 4px solid white;
                    display: flex; align-items: center; justify-content: center;
                    background: rgba(255,255,255,0.1); border-radius: 50%;
                }
                .viewport-tag { position: absolute; bottom: 1.5rem; left: 2rem; color: white; font-weight: 900; font-size: 0.7rem; opacity: 0.6; }

                .demo-footer { margin-top: 2rem; text-align: center; font-weight: 900; opacity: 0.5; font-size: 0.8rem; letter-spacing: 0.05em; }

                @media (max-width: 1100px) {
                    .hero-main-content { grid-template-columns: 1fr; text-align: center; }
                    .hero-text-side { display: flex; flex-direction: column; align-items: center; }
                    .hero-headline { font-size: 3.5rem; }
                    .hero-orbital-side { height: 400px; }
                    .hero-cta-group { flex-direction: column; gap: 1rem; }
                    .nav-links-hero { display: none; }
                }

                .bg-red { background: var(--primary-red); color: white; border-color: black; }
            `}</style>
        </div>
    );
};

export default HeroLanding;
