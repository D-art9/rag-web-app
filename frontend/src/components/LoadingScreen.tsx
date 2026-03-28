import React, { useState, useEffect } from 'react';

const technicalLogs = [
    "[INIT] SYSTEM_CONTACT: ESTABLISHING_YOUTUBE_BRIDGE...",
    "[SYS] TUNNEL_RECONNECT: STABILIZING_LOCAL_NODE_BRIDGE...",
    "[P1] AUDIO_EXTRACT: DOWNLOADING_AUDIO_STREAMS...",
    "[P1] TEXT_LAYER: GENERATING_TRANSCRIPT_CHUNKS...",
    "[P2] VISION_SYNC: GEMINI_1.5_FLASH_ANALYZING_THUMBNAIL...",
    "[SYS] SYNC: ALIGNING_MULTIMODAL_VECTORS...",
    "[FUSION] VECTOR_CORE: CALCULATING_SEMANTIC_EMBEDDINGS (1536d)...",
    "[DB] MONGODB_SAVE: SECURING_DOCUMENT_STORAGE...",
    "[RAG] MISSION_READY: INITIALIZING_CONSTRUCTIVIST_WORKSPACE..."
];

const infraStack = ["MONGODB_ATLAS", "GEMINI_1.5_FLASH", "PINECONE_VEC", "EXPRESS_v4.1", "T_TRANSFORMERS"];

const DATA_STEPS = [
    { title: "AUDIO_INGESTION", desc: "Extracting high-fidelity MP3 streams from YouTube source.", color: "var(--primary-red)" },
    { title: "VISION_SAMPLING", desc: "Performing deep neural analysis on visual metadata and frames.", color: "var(--primary-blue)" },
    { title: "NEURAL_VECTORIZATION", desc: "Converting multimodal data into 1536-dimensional math vectors.", color: "var(--primary-yellow)" },
    { title: "RAG_SYNERGY", desc: "Mapping visual insights against audio transcripts for 100% accuracy.", color: "var(--border-color)" }
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
        <div className="loading-v6">
            <div className="bauhaus-bg-grid"></div>

            {/* MAIN INTERFACE */}
            <div className="view-container">
                
                {/* TOP HEADER - SYSTEM STATUS */}
                <header className="system-hdr bauhaus-border-bottom">
                    <div className="hdr-meta">
                        <span className="dot pulse"></span>
                        <span className="st-txt">MISSION_ACTIVE: {message}</span>
                    </div>
                    <div className="hdr-title">SCRIPTYT_v2.1_CORE // {infraStatus}</div>
                    <div className="hdr-telemetry">CPU_READY: {counter} // VEC_DIM: 1536d</div>
                </header>

                {/* THE CORE VISUALIZER ENGINE */}
                <div className="visualizer-field">
                    
                    {/* INPUT SOURCE */}
                    <div className="ingestion-node bauhaus-border">
                        <div className="node-caption">00_YT_SOURCE</div>
                        <div className="node-icon">🛰️</div>
                        <div className="node-status">STABILIZED</div>
                    </div>

                    {/* DYNAMIC FLOW CHANNELS */}
                    <div className="flow-complex">
                        <div className="channel audio-channel">
                            <div className="beam beam-red"></div>
                            <div className={`intel-card ${activeStep === 0 ? 'active' : ''}`}>
                                <label style={{ color: 'var(--primary-red)' }}>TIER_01: AUDIO_CORE</label>
                                <p>{DATA_STEPS[0].desc}</p>
                            </div>
                        </div>

                        <div className="channel vision-channel">
                            <div className="beam beam-blue"></div>
                            <div className={`intel-card ${activeStep === 1 ? 'active' : ''}`}>
                                <label style={{ color: 'var(--primary-blue)' }}>TIER_02: VISION_SYNC</label>
                                <p>{DATA_STEPS[1].desc}</p>
                            </div>
                        </div>
                    </div>

                    {/* CONVERGENCE POINT */}
                    <div className="convergence-node">
                        <div className={`fusion-ring ${activeStep >= 2 ? 'spinning' : ''}`}></div>
                        <div className="node-center bauhaus-border bauhaus-shadow">
                            <div className="node-caption">03_VECTOR_FUSION</div>
                            <div className="fusion-status">{DATA_STEPS[activeStep].title}</div>
                        </div>
                        
                        {/* FINAL CONTEXT LABEL */}
                        <div className={`context-desc ${activeStep >= 2 ? 'fade-in' : ''}`}>
                           [!] {DATA_STEPS[activeStep].desc}
                        </div>
                    </div>
                </div>

                {/* SIDE INFRA STACK */}
                <div className="infra-stack-view">
                   {infraStack.map((s, i) => (
                       <div key={i} className="stack-row">
                           <span className="row-num">0{i+1}</span>
                           <span className="row-val">{s}</span>
                       </div>
                   ))}
                </div>

                {/* BOTTOM LOG STREAM */}
                <footer className="footer-logs bauhaus-border-top">
                    <div className="log-prefix bg-red">DATAFLOW_LOG_v2.1</div>
                    <div className="log-msg">{technicalLogs[logIndex]}</div>
                    <div className="log-timer">ELAPSED: {(counter / 100).toFixed(1)}s</div>
                </footer>
            </div>

            <style>{`
                .loading-v6 {
                    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
                    background: #F4F4F4; z-index: 1000; overflow: hidden;
                    font-family: 'Outfit', sans-serif; color: #1a1a1a;
                }
                .bauhaus-bg-grid {
                    position: absolute; top: 0; left: 0; right: 0; bottom: 0;
                    background-image: linear-gradient(#ddd 1px, transparent 1px), linear-gradient(90deg, #ddd 1px, transparent 1px);
                    background-size: 60px 60px; opacity: 0.15; z-index: -1;
                }

                .view-container {
                    height: 100vh; display: flex; flex-direction: column; padding: 2rem 4rem;
                }

                /* HEADER */
                .system-hdr {
                    display: flex; justify-content: space-between; align-items: center;
                    padding-bottom: 2rem; margin-bottom: 2rem;
                }
                .hdr-title { font-weight: 900; font-size: 1.2rem; letter-spacing: 0.2em; color: var(--primary-red); }
                .hdr-meta { display: flex; align-items: center; gap: 1rem; font-weight: 900; font-size: 0.7rem; }
                .hdr-telemetry { font-weight: 900; font-size: 0.7rem; color: #666; }
                .pulse { width: 10px; height: 10px; background: var(--primary-red); border-radius: 50%; display: block; }
                @keyframes pulse-anim { 0% { opacity: 1; transform: scale(1); } 50% { opacity: 0.4; transform: scale(1.5); } 100% { opacity: 1; transform: scale(1); } }
                .pulse { animation: pulse-anim 1s infinite; }

                /* FIELD */
                .visualizer-field {
                    flex-grow: 1; display: flex; flex-direction: column; align-items: center; position: relative;
                }

                .ingestion-node {
                    background: white; padding: 1.5rem 3rem; text-align: center; position: relative;
                    box-shadow: 10px 10px 0px black; transition: transform 0.3s;
                }
                .node-caption { font-size: 0.6rem; font-weight: 900; color: #999; margin-bottom: 0.5rem; }
                .node-icon { font-size: 2rem; margin: 0.5rem 0; }
                .node-status { font-weight: 900; font-size: 0.7rem; color: var(--primary-blue); }

                /* FLOW */
                .flow-complex { display: flex; gap: 15rem; width: 100%; justify-content: center; }
                .channel { position: relative; width: 6px; height: 250px; background: #ddd; }
                
                .beam { position: absolute; top: 0; left: -2px; width: 10px; height: 60px; filter: blur(2px); }
                .beam-red { background: var(--primary-red); animation: beam-flow 1.5s infinite linear; }
                .beam-blue { background: var(--primary-blue); animation: beam-flow 2s infinite linear 0.5s; }

                @keyframes beam-flow { 0% { top: -60px; opacity: 0; } 50% { opacity: 1; } 100% { top: 100%; opacity: 0; } }

                /* CARDS */
                .intel-card {
                    position: absolute; left: 30px; width: 280px; opacity: 0; transform: translateX(20px);
                    transition: all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275); background: white;
                    padding: 1.5rem; border-left: 5px solid; box-shadow: 5px 5px 0px rgba(0,0,0,0.05);
                }
                .intel-card.active { opacity: 1; transform: translateX(0); }
                .intel-card label { display: block; font-weight: 900; font-size: 0.7rem; margin-bottom: 0.5rem; letter-spacing: 0.1em; }
                .intel-card p { font-size: 0.9rem; font-weight: 500; margin: 0; line-height: 1.4; }

                /* FUSION */
                .convergence-node { margin-top: 2rem; position: relative; text-align: center; }
                .node-center { background: white; padding: 2rem 4rem; z-index: 10; position: relative; min-width: 320px; }
                .fusion-status { font-weight: 900; font-size: 1.2rem; color: #1a1a1a; margin-top: 0.5rem; }
                
                .fusion-ring {
                    position: absolute; top: -50px; left: 50%; transform: translateX(-50%);
                    width: 440px; height: 440px; border: 2px dashed #999; border-radius: 50%;
                    pointer-events: none; opacity: 0.2;
                }
                .fusion-ring.spinning { animation: rot 20s infinite linear; opacity: 0.5; border-color: var(--primary-yellow); }
                @keyframes rot { from { transform: translateX(-50%) rotate(0deg); } to { transform: translateX(-50%) rotate(360deg); } }

                .context-desc {
                    margin-top: 3rem; font-weight: 900; font-size: 0.9rem; color: var(--primary-red);
                    max-width: 500px; line-height: 1.4; opacity: 0; transition: opacity 0.5s;
                }
                .context-desc.fade-in { opacity: 1; }

                /* SIDE STACK */
                .infra-stack-view {
                    position: fixed; right: 4rem; top: 50%; transform: translateY(-50%); width: 220px;
                }
                .stack-row { display: flex; gap: 1rem; border-bottom: 2px solid rgba(0,0,0,0.05); padding: 1rem 0; }
                .row-num { font-weight: 900; color: #999; font-size: 0.7rem; }
                .row-val { font-weight: 900; font-size: 0.8rem; }

                /* LOGS */
                .footer-logs {
                    display: flex; height: 80px; align-items: center; padding: 0 2rem; background: white;
                }
                .log-prefix { height: 100%; display: flex; align-items: center; padding: 0 2rem; color: white; font-weight: 900; font-size: 0.7rem; }
                .log-msg { flex-grow: 1; padding: 0 3rem; font-weight: 900; font-size: 1.1rem; letter-spacing: -0.02em; }
                .log-timer { font-weight: 900; font-size: 0.8rem; color: #999; }

                .bauhaus-border-bottom { border-bottom: 4px solid #1a1a1a; }
                .bauhaus-border-top { border-top: 4px solid #1a1a1a; }
                .bg-red { background: var(--primary-red); }
            `}</style>
        </div>
    );
};

export default LoadingScreen;
