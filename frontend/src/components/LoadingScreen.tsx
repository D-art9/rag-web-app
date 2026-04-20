import React, { useState, useEffect } from 'react';
import { Network, Search, Cpu, Activity, Zap } from 'lucide-react';

const technicalLogs = [
    "[INIT] SYSTEM_CONTACT: ESTABLISHING_YOUTUBE_BRIDGE...",
    "[SYS] TUNNEL_RECONNECT: STABILIZING_LOCAL_NODE_BRIDGE...",
    "[P1] AUDIO_EXTRACT: DOWNLOADING_AUDIO_STREAMS...",
    "[P1] TEXT_LAYER: GENERATING_TRANSCRIPT_CHUNKS...",
    "[P2] VISION_SYNC: GEMINI_1.5_FLASH_ANALYZING_THUMBNAIL...",
    "[SYS] SYNC: ALIGNING_MULTIMODAL_VECTORS...",
    "[FUSION] VECTOR_CORE: CALCULATING_SEMANTIC_EMBEDDINGS (1536d)...",
    "[DB] NATIVE_STORAGE: WRITING_JSON_VECTORS_TO_DISK...",
    "[RAG] MISSION_READY: INITIALIZING_CONSTRUCTIVIST_WORKSPACE..."
];

const infraStack = ["MONGODB_ATLAS", "GEMINI_2.5_FLASH", "NATIVE_VEC_JSON", "EXPRESS_v4.1", "T_TRANSFORMERS"];

const DATA_STEPS = [
    { title: "AUDIO_INGESTION", desc: "Extracting high-fidelity MP3 streams from YouTube source.", icon: <Network /> },
    { title: "VISION_SAMPLING", desc: "Performing deep neural analysis on visual metadata and frames.", icon: <Search /> },
    { title: "NEURAL_VECTORIZATION", desc: "Converting multimodal data into 1536-dimensional math vectors.", icon: <Cpu /> },
    { title: "RAG_SYNERGY", desc: "Mapping visual insights against audio transcripts for 100% accuracy.", icon: <Zap /> }
];

const LoadingScreen: React.FC<{ message?: string }> = ({ message = "SYSTEM_INGESTION_ACTIVE" }) => {
    const [logIndex, setLogIndex] = useState(0);
    const [counter, setCounter] = useState(256);
    const [activeStep, setActiveStep] = useState(0);
    const [infraStatus, setInfraStatus] = useState("INGESTION_ACTIVE");

    useEffect(() => {
        const logInt = setInterval(() => setLogIndex((p) => (p + 1) % technicalLogs.length), 3000);
        const countInt = setInterval(() => setCounter(p => p + Math.floor(Math.random() * 50)), 500);
        const stepInt = setInterval(() => setActiveStep((p) => (p + 1) % DATA_STEPS.length), 4000);
        const statusT = setTimeout(() => setInfraStatus("WARMING_UP_LOCAL_CORES"), 7000);

        return () => { 
            clearInterval(logInt); 
            clearInterval(countInt); 
            clearInterval(stepInt);
            clearTimeout(statusT);
        };
    }, []);

    return (
        <div className="loading-dark-industrial scroll-panel">
            {/* TOP HEADER */}
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', padding: '0 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div className="pulse-cyan" />
                    <span className="industrial-label" style={{ margin: 0 }}>MISSION_ACTIVE: {message}</span>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <div className="industrial-label" style={{ color: 'var(--text-muted)' }}>SCRIPTYT_v2.1_CORE {" // "} {infraStatus}</div>
                    <h1 style={{ fontWeight: 900, fontSize: '24px', letterSpacing: '2px', margin: '4px 0 0 0', color: 'white' }}>SYSTEM_CONVERGENCE</h1>
                </div>
                <div className="industrial-label" style={{ color: 'var(--accent-cyan)' }}>
                    CPU_READY: {counter} {" // "} VEC_DIM: 1536d
                </div>
            </header>

            {/* MAIN VISUALIZER GRID */}
            <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr 300px', gap: '40px', flex: 1, padding: '0 20px', alignItems: 'center' }}>
                
                {/* LEFT INFRA PANEL */}
                <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '2px', padding: '24px' }}>
                    <div className="industrial-label" style={{ marginBottom: '16px', color: 'var(--primary-yellow)' }}>ACTIVE_STACK</div>
                    {infraStack.map((s, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <span style={{ color: 'var(--accent-cyan)', fontSize: '10px', fontFamily: 'monospace' }}>0{i+1}</span>
                            <span style={{ color: 'white', fontSize: '12px', fontWeight: 600 }}>{s}</span>
                        </div>
                    ))}
                </div>

                {/* CENTER HOLOGRAPHIC CORE */}
                <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                    {/* Ring animation */}
                    <div className="holo-ring"></div>
                    <div className="holo-ring reverse-ring"></div>
                    
                    {/* Core node */}
                    <div className="glass-card" style={{ 
                        position: 'relative', zIndex: 10, padding: '40px', 
                        display: 'flex', flexDirection: 'column', alignItems: 'center', 
                        border: '1px solid var(--accent-cyan)',
                        boxShadow: '0 0 30px rgba(0,242,255,0.1)'
                    }}>
                        <div style={{ color: 'var(--accent-cyan)', marginBottom: '16px' }}>
                            {DATA_STEPS[activeStep].icon}
                        </div>
                        <div className="industrial-label" style={{ color: 'var(--accent-cyan)', margin: 0, fontSize: '14px' }}>{DATA_STEPS[activeStep].title}</div>
                        <p style={{ color: 'var(--text-muted)', fontSize: '12px', textAlign: 'center', maxWidth: '200px', margin: '16px 0 0 0', lineHeight: 1.5 }}>
                            {DATA_STEPS[activeStep].desc}
                        </p>
                    </div>
                </div>

                {/* RIGHT PIPELINE PANEL */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {DATA_STEPS.map((step, idx) => (
                        <div key={idx} className="glass-card" style={{ 
                            padding: '16px', 
                            borderLeft: activeStep === idx ? '3px solid var(--accent-cyan)' : '3px solid rgba(255,255,255,0.05)',
                            opacity: activeStep === idx ? 1 : 0.4,
                            transition: 'all 0.3s'
                        }}>
                            <div className="industrial-label" style={{ fontSize: '10px' }}>PHASE_0{idx+1}</div>
                            <div style={{ color: 'white', fontSize: '12px', fontWeight: 600, marginTop: '4px' }}>{step.title}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* BOTTOM LOGS */}
            <div className="glass-card" style={{ display: 'flex', alignItems: 'center', padding: '16px 24px', margin: '40px 20px 0 20px', gap: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Activity size={14} color="var(--primary-yellow)" />
                    <div className="industrial-label" style={{ color: 'var(--primary-yellow)', margin: 0 }}>DATAFLOW_LOG</div>
                </div>
                <div style={{ flex: 1, fontFamily: 'monospace', fontSize: '13px', color: 'var(--text-muted)' }}>
                    {technicalLogs[logIndex]}
                </div>
                <div style={{ fontFamily: 'monospace', fontSize: '12px', color: 'var(--accent-cyan)' }}>
                    ELAPSED: {(counter / 100).toFixed(1)}s
                </div>
            </div>

            <style>{`
                .loading-dark-industrial {
                    display: flex; flexDirection: column; height: 100vh;
                    background: var(--bg-core); color: white; padding: 20px;
                    justify-content: space-between; overflow: hidden;
                }
                .pulse-cyan {
                    width: 8px; height: 8px; background: var(--accent-cyan); border-radius: 50%;
                    animation: pulse-c 1s infinite alternate;
                }
                @keyframes pulse-c { 0% { opacity: 0.3; transform: scale(1); box-shadow: 0 0 0 transparent; } 100% { opacity: 1; transform: scale(1.2); box-shadow: 0 0 10px var(--accent-cyan); } }
                
                .holo-ring {
                    position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
                    width: 300px; height: 300px; border-radius: 50%;
                    border: 1px dashed rgba(0,242,255,0.2);
                    animation: spin-r 15s linear infinite;
                    pointer-events: none;
                }
                .reverse-ring {
                    width: 400px; height: 400px; border: 1px solid rgba(255,255,255,0.02);
                    animation: spin-r 25s linear infinite reverse;
                }
                @keyframes spin-r { 100% { transform: translate(-50%, -50%) rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default LoadingScreen;
