import React, { useState, useEffect } from 'react';

const technicalLogs = [
    "[INIT] SYSTEM_CONTACT: ESTABLISHING_YOUTUBE_BRIDGE...",
    "[P1] AUDIO_EXTRACT: DOWNLOADING_AUDIO_STREAMS...",
    "[P1] TEXT_LAYER: GENERATING_TRANSCRIPT_CHUNKS...",
    "[P2] VISION_SYNC: GEMINI_1.5_FLASH_ANALYZING_THUMBNAIL...",
    "[P2] VISUAL_DESCRIPTION: INJECTING_IMAGE_METADATA_INTO_CHUNK_0...",
    "[FUSION] VECTOR_CORE: CALCULATING_SEMANTIC_EMBEDDINGS (1536d)...",
    "[DB] MONGODB_SAVE: SECURING_DOCUMENT_STORAGE...",
    "[RAG] MISSION_READY: INITIALIZING_CONSTRUCTIVIST_WORKSPACE..."
];

const infraStack = ["MONGODB_ATLAS", "GEMINI_1.5_FLASH", "PINECONE_VEC", "EXPRESS_v4.1", "T_TRANSFORMERS"];

const LoadingScreen: React.FC<{ message?: string }> = ({ message = "SYSTEM_INGESTION_ACTIVE" }) => {
    const [logIndex, setLogIndex] = useState(0);
    const [counter, setCounter] = useState(256);

    useEffect(() => {
        const logInt = setInterval(() => setLogIndex((p) => (p + 1) % technicalLogs.length), 3000);
        const countInt = setInterval(() => setCounter(p => p + Math.floor(Math.random() * 50)), 500);
        return () => { clearInterval(logInt); clearInterval(countInt); };
    }, []);

    return (
        <div className="bauhaus-loading-v4">
            
            {/* BACKGROUND DECORATIVE SHAPES */}
            <div className="bg-shape shadow-red"></div>
            <div className="bg-shape shadow-blue"></div>
            <div className="bauhaus-bg-grid"></div>

            {/* LEFT TELEMETRY PANEL */}
            <aside className="side-panel panel-left bauhaus-border">
                <div className="panel-tag bg-blue">TELEMETRY_STREAM</div>
                <div className="metric-group">
                    <div className="metric">
                        <span className="m-label">VEC_STAGED:</span>
                        <span className="m-val">{counter}</span>
                    </div>
                    <div className="metric">
                        <span className="m-label">DIMENSIONS:</span>
                        <span className="m-val">1536d</span>
                    </div>
                    <div className="metric">
                        <span className="m-label">LATENCY_MS:</span>
                        <span className="m-val">{(Math.random() * 200 + 400).toFixed(0)}</span>
                    </div>
                </div>
            </aside>

            {/* RIGHT INFRA PANEL */}
            <aside className="side-panel panel-right bauhaus-border">
                <div className="panel-tag bg-red">CORE_ST_ARCH</div>
                <div className="stack-links">
                    {infraStack.map((s, i) => (
                        <div key={i} className="stack-item">[{i+1}] {s}</div>
                    ))}
                </div>
            </aside>

            {/* MAIN CONTENT CANVAS */}
            <div className="canvas-center">
                <header className="ingest-header-v4">
                    <div className="system-code">SCRIPTYT_v2.1_CORE</div>
                    <h1 className="heading-xxl">NEURAL_CONVERGENCE</h1>
                </header>

                <div className="flow-canvas-v4">
                    <div className="source-node-v4 bauhaus-border">YOUTUBE_SOURCE_IN</div>

                    <div className="pipeline-split-v4">
                        <div className="stream stream-audio">
                             <div className="stream-line line-red">
                                 <div className="particle circle red-bg move-down-1"></div>
                             </div>
                             <div className="stream-label">AUDIO_PIPELINE</div>
                        </div>
                        <div className="stream stream-vision">
                             <div className="stream-line line-blue">
                                 <div className="particle square blue-bg move-down-2"></div>
                             </div>
                             <div className="stream-label">VISION_PIPELINE</div>
                        </div>
                    </div>

                    <div className="fusion-node-v4 bauhaus-border btn-yellow bauhaus-shadow">
                        <div className="fusion-label">FUSION_VECTOR_DB</div>
                        <div className="spinner-bauhaus"></div>
                    </div>
                </div>
            </div>

            {/* BOTTOM TICKER */}
            <footer className="explainer-footer-v4 bauhaus-border bauhaus-shadow">
                <div className="ticker-label-v4 bg-red">DATAFLOW_LOG_v.21</div>
                <div className="ticker-content-v4">
                    <div className="ticker-text-wrapper active">
                        {technicalLogs[logIndex]}
                    </div>
                </div>
            </footer>

            <style>{`
                .bauhaus-loading-v4 {
                    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
                    background: #F0F0F0; z-index: 1000; overflow: hidden;
                    display: grid; grid-template-columns: 250px 1fr 250px; align-items: center;
                    font-family: 'Outfit', sans-serif;
                }

                .bauhaus-bg-grid {
                    position: absolute; top: 0; left: 0; right: 0; bottom: 0;
                    background-image: linear-gradient(#e0e0e0 1px, transparent 1px), linear-gradient(90deg, #e0e0e0 1px, transparent 1px);
                    background-size: 50px 50px; opacity: 0.3; z-index: -2;
                }

                /* DECORATIVE BACKGROUND */
                .bg-shape { position: absolute; border-radius: 50%; z-index: -1; opacity: 0.05; filter: blur(50px); }
                .shadow-red { width: 600px; height: 600px; background: var(--primary-red); top: -100px; left: -100px; }
                .shadow-blue { width: 400px; height: 400px; background: var(--primary-blue); bottom: -100px; right: -100px; }

                /* SIDE PANELS */
                .side-panel { 
                    height: 60vh; width: 100%; display: flex; flex-direction: column; background: white; 
                    z-index: 5; box-shadow: 10px 10px 0px rgba(0,0,0,0.05);
                }
                .panel-left { margin-left: 2rem; }
                .panel-right { margin-right: 2rem; }
                .panel-tag { padding: 0.5rem; color: white; font-weight: 900; font-size: 0.6rem; text-align: center; }

                .metric-group, .stack-links { padding: 2rem 1.5rem; display: flex; flex-direction: column; gap: 1.5rem; }
                .metric { display: flex; flex-direction: column; border-bottom: 2px solid #F0F0F0; padding-bottom: 0.5rem; }
                .m-label { font-size: 0.6rem; font-weight: 900; color: #999; }
                .m-val { font-size: 1.5rem; font-weight: 900; color: #121212; }

                .stack-item { font-weight: 900; font-size: 0.8rem; color: #333; letter-spacing: 0.05em; }

                /* CENTER */
                .canvas-center { display: flex; flex-direction: column; align-items: center; justify-self: center; }
                .ingest-header-v4 { text-align: center; margin-bottom: 4rem; }
                .heading-xxl { font-weight: 900; font-size: 4rem; letter-spacing: -0.05em; margin: 0; line-height: 1; }
                .system-code { font-weight: 900; color: var(--primary-red); margin-bottom: 0.5rem; letter-spacing: 0.4em; }

                /* FLOW COMPONENTS */
                .flow-canvas-v4 { display: flex; flex-direction: column; align-items: center; }
                .source-node-v4 { padding: 0.5rem 2rem; background: white; font-weight: 900; box-shadow: 4px 4px 0px black; z-index: 10; font-size: 0.8rem; }
                .pipeline-split-v4 { display: flex; gap: 10rem; }
                .stream-line { width: 4px; height: 180px; background: black; position: relative; overflow: hidden; }
                .particle { position: absolute; width:14px; height: 14px; border: 2.5px solid black; left: -7px; animation: slide-down 1s infinite linear; }
                @keyframes slide-down { 0% { top: -20px; } 100% { top: 100%; } }

                .fusion-node-v4 { margin-top: 2rem; padding: 1rem 3rem; display: flex; flex-direction: column; align-items: center; gap: 0.5rem; }
                .spinner-bauhaus { width: 25px; height: 25px; border: 4px solid black; border-top-color: white; border-radius: 50%; animation: rotate 1s infinite linear; }
                @keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

                /* FOOTER */
                .explainer-footer-v4 { 
                    position: fixed; bottom: 3rem; left: 50%; transform: translateX(-50%); width: 800px; max-width: 90vw; background: white;
                    display: flex; height: 60px;
                }
                .ticker-label-v4 { padding: 0 1.5rem; display: flex; align-items: center; color: white; font-weight: 900; font-size: 0.7rem; }
                .ticker-content-v4 { flex-grow: 1; padding: 0 2rem; display: flex; align-items: center; overflow: hidden; }
                .ticker-text-wrapper { font-weight: 900; font-size: 1.2rem; transition: 0.3s; }

                @media (max-width: 1100px) {
                    .bauhaus-loading-v4 { grid-template-columns: 1fr; }
                    .side-panel { display: none; }
                    .bg-shape { display: none; }
                }

                .bg-blue { background: var(--primary-blue); }
                .bg-red { background: var(--primary-red); }
            `}</style>
        </div>
    );
};

export default LoadingScreen;
