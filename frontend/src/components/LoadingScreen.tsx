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

const LoadingScreen: React.FC<{ message?: string }> = ({ message = "SYSTEM_INGESTION_ACTIVE" }) => {
    const [logIndex, setLogIndex] = useState(0);
    const [counter, setCounter] = useState(256);
    const [infraStatus, setInfraStatus] = useState("INGESTION_ACTIVE");

    useEffect(() => {
        const logInt = setInterval(() => setLogIndex((p) => (p + 1) % technicalLogs.length), 3000);
        const countInt = setInterval(() => setCounter(p => p + Math.floor(Math.random() * 50)), 500);
        
        // After 7 seconds, if still loading, show the "Warming Up" message
        const statusT = setTimeout(() => setInfraStatus("WARMING_UP_LOCAL_CORES"), 7000);

        return () => { 
            clearInterval(logInt); 
            clearInterval(countInt); 
            clearTimeout(statusT);
        };
    }, []);

    return (
        <div className="loading-v5">
            <div className="bauhaus-bg-grid"></div>

            {/* MAIN GRID CONTAINER */}
            <div className="grid-outer">
                
                {/* LEFT PANEL */}
                <aside className="panel panel-l bauhaus-border">
                    <div className="p-tag bg-blue">TELEMETRY_STREAM</div>
                    <div className="p-body">
                        <div className="met">
                            <span className="m-l">VEC_STAGED:</span>
                            <span className="m-v">{counter}</span>
                        </div>
                        <div className="met">
                            <span className="m-l">DIMENSIONS:</span>
                            <span className="m-v">1536d</span>
                        </div>
                        <div className="met">
                            <span className="m-l">LATENCY_MS:</span>
                            <span className="m-v">{(Math.random() * 200 + 400).toFixed(0)}</span>
                        </div>
                    </div>
                </aside>

                {/* CENTER HUB */}
                <main className="hub-center">
                    <header className="hub-header">
                        <div className="sys-code">SCRIPTYT_v2.1_CORE // {infraStatus}</div>
                        <h1 className="h-xxl">SYSTEM_CONVERGENCE</h1>
                    </header>

                    <div className="hub-vis">
                        <div className="s-node bauhaus-border">YOUTUBE_SOURCE_IN</div>
                        
                        <div className="s-flow">
                            <div className="str">
                                <div className="str-l line-red"><div className="pt red-bg p-move"></div></div>
                                <span className="str-t">AUDIO_P1</span>
                            </div>
                            <div className="str">
                                <div className="str-l line-blue"><div className="pt blue-bg p-move-delay"></div></div>
                                <span className="str-t">VISION_P2</span>
                            </div>
                        </div>

                        <div className="f-node bauhaus-border btn-yellow bauhaus-shadow">
                            <span className="f-l">VECTOR_FUSION</span>
                            <div className="spin"></div>
                        </div>
                    </div>
                </main>

                {/* RIGHT PANEL */}
                <aside className="panel panel-r bauhaus-border">
                    <div className="p-tag bg-red">CORE_ST_ARCH</div>
                    <div className="p-body stack-list">
                        {infraStack.map((s, i) => (
                            <div key={i} className="st-item">[{i+1}] {s}</div>
                        ))}
                    </div>
                </aside>
            </div>

            {/* TICKER */}
            <footer className="hub-ticker bauhaus-border bauhaus-shadow">
                <div className="t-tag bg-red">DATAFLOW_LOG_v.21</div>
                <div className="t-box">{technicalLogs[logIndex]}</div>
            </footer>

            <style>{`
                .loading-v5 {
                    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
                    background: #F0F0F0; z-index: 1000; overflow: hidden;
                    font-family: 'Outfit', sans-serif; padding: 2rem;
                }

                .bauhaus-bg-grid {
                    position: absolute; top: 0; left: 0; right: 0; bottom: 0;
                    background-image: linear-gradient(#ddd 1px, transparent 1px), linear-gradient(90deg, #ddd 1px, transparent 1px);
                    background-size: 40px 40px; opacity: 0.2; z-index: -1;
                }

                .grid-outer {
                    display: grid; grid-template-columns: 280px 1fr 280px; gap: 2rem;
                    max-width: 1400px; margin: 0 auto; height: 100%; align-items: center;
                }

                .panel { background: white; height: auto; align-self: center; display: flex; flex-direction: column; }
                .p-tag { padding: 0.6rem; color: white; font-weight: 900; font-size: 0.7rem; text-align: center; }
                .p-body { padding: 1.5rem; display: flex; flex-direction: column; gap: 1.2rem; }
                
                .met { display: flex; flex-direction: column; border-bottom: 2px solid #f9f9f9; }
                .m-l { font-size: 0.6rem; font-weight: 900; color: #999; }
                .m-v { font-size: 1.4rem; font-weight: 900; }

                .st-item { font-weight: 900; font-size: 0.8rem; letter-spacing: 0.05em; }

                /* CENTER */
                .hub-center { text-align: center; display: flex; flex-direction: column; align-items: center; }
                .hub-header { margin-bottom: 3rem; }
                .sys-code { font-weight: 900; color: var(--primary-red); letter-spacing: 0.5em; font-size: 0.8rem; margin-bottom: 0.5rem; }
                .h-xxl { font-weight: 900; font-size: 3.5rem; letter-spacing: -0.05em; margin: 0; }

                /* VISUALIZER */
                .hub-vis { display: flex; flex-direction: column; align-items: center; }
                .s-node { padding: 0.6rem 2rem; background: white; font-weight: 900; box-shadow: 6px 6px 0px black; z-index: 10; font-size: 0.8rem; }
                
                .s-flow { display: flex; gap: 6rem; padding-top: 1rem; }
                .str { display: flex; flex-direction: column; align-items: center; gap: 0.5rem; }
                .str-l { width: 4px; height: 140px; background: black; position: relative; overflow: hidden; }
                .pt { position: absolute; width: 14px; height: 14px; border: 2.5px solid black; left: -7px; }
                .p-move { animation: s-d 1.1s infinite linear; }
                .p-move-delay { animation: s-d 1.1s infinite linear 0.5s; }
                @keyframes s-d { 0% { top: -20px; } 100% { top: 100%; } }
                .str-t { font-weight: 900; font-size: 0.6rem; color: #666; }

                .f-node { margin-top: 1rem; padding: 1rem 2rem; display: flex; flex-direction: column; align-items: center; gap: 0.8rem; }
                .f-l { font-weight: 900; font-size: 0.9rem; }
                .spin { width: 22px; height: 22px; border: 4px solid black; border-top-color: white; border-radius: 50%; animation: rot 1s infinite linear; }
                @keyframes rot { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

                /* TICKER */
                .hub-ticker { 
                    position: fixed; bottom: 3rem; left: 50%; transform: translateX(-50%);
                    width: auto; min-width: 600px; display: flex; background: white; height: 60px;
                }
                .t-tag { padding: 0 1.5rem; display: flex; align-items: center; color: white; font-weight: 900; font-size: 0.7rem; }
                .t-box { flex-grow: 1; padding: 0 2rem; display: flex; align-items: center; font-weight: 900; font-size: 1.1rem; }

                @media (max-width: 1000px) {
                    .grid-outer { grid-template-columns: 1fr; }
                    .panel { display: none; }
                    .h-xxl { font-size: 2.5rem; }
                }

                .bg-blue { background: var(--primary-blue); }
                .bg-red { background: var(--primary-red); }
            `}</style>
        </div>
    );
};

export default LoadingScreen;
