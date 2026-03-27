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

interface LoadingScreenProps {
    message?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ message = "SYSTEM_INGESTION_ACTIVE" }) => {
    const [logIndex, setLogIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setLogIndex((prev) => (prev + 1) % technicalLogs.length);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="bauhaus-loading-v3">
            
            {/* BACKGROUND_GRID */}
            <div className="bauhaus-bg-grid"></div>

            {/* INFOGRAPHIC HEADER */}
            <header className="ingest-header-v3">
                <div className="system-code">SCRIPTYT_v2.1</div>
                <h1 className="heading-xl">SYSTEM_CONVERGENCE</h1>
            </header>

            {/* THE KINETIC FLOW CHART */}
            <div className="flow-canvas-v3">
                <div className="source-node bauhaus-border">YOUTUBE_SOURCE_IN</div>

                <div className="pipeline-split-v3">
                    <div className="stream stream-audio">
                         <div className="stream-line line-red">
                             <div className="particle circle red-bg move-down-1"></div>
                             <div className="particle square red-bg move-down-2"></div>
                         </div>
                         <div className="stream-label">AUDIO_PIPELINE</div>
                    </div>

                    <div className="stream stream-vision">
                         <div className="stream-line line-blue">
                             <div className="particle circle blue-bg move-down-2"></div>
                             <div className="particle triangle-up blue-bg move-down-1"></div>
                         </div>
                         <div className="stream-label">VISION_PIPELINE</div>
                    </div>
                </div>

                <div className="fusion-node-v3 bauhaus-border btn-yellow">
                    <div className="fusion-label">VECTOR_FUSION</div>
                    <div className="spinner-bauhaus"></div>
                </div>
            </div>

            {/* THE EXPLAINER_TICKER */}
            <footer className="explainer-footer bauhaus-border bauhaus-shadow">
                <div className="ticker-label bg-red">LIVE_DATAFLOW_STATUS</div>
                <div className="ticker-content">
                    <div className="ticker-text-wrapper active">
                        {technicalLogs[logIndex]}
                    </div>
                </div>
            </footer>

            <style>{`
                .bauhaus-loading-v3 {
                    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
                    background: #F0F0F0; z-index: 1000;
                    display: flex; flex-direction: column; align-items: center; justify-content: center;
                    font-family: 'Outfit', sans-serif; overflow: hidden;
                }

                .bauhaus-bg-grid {
                    position: absolute; top: 0; left: 0; right: 0; bottom: 0;
                    background-image: linear-gradient(#e0e0e0 1px, transparent 1px), linear-gradient(90deg, #e0e0e0 1px, transparent 1px);
                    background-size: 50px 50px; opacity: 0.5; z-index: -1;
                }

                .ingest-header-v3 { text-align: center; margin-bottom: 3rem; }
                .system-code { font-weight: 900; color: var(--primary-red); letter-spacing: 0.3em; margin-bottom: 0.5rem; }
                .heading-xl { font-weight: 900; font-size: 3rem; margin: 0; letter-spacing: -0.05em; }

                /* FLOW CHART */
                .flow-canvas-v3 { display: flex; flex-direction: column; align-items: center; position: relative; }
                .source-node { padding: 0.8rem 2rem; background: white; font-weight: 900; box-shadow: 6px 6px 0px black; z-index: 10; font-size: 0.8rem; }

                .pipeline-split-v3 { display: flex; gap: 8rem; position: relative; padding-top: 30px; }
                .pipeline-split-v3::before {
                    content: ''; position: absolute; top: 0; left: 50%; width: 8rem; height: 4px; background: black; transform: translateX(-50%);
                }

                .stream { display: flex; flex-direction: column; align-items: center; position: relative; }
                .stream-line { width: 4px; height: 180px; background: black; position: relative; overflow: hidden; }
                .stream-label { font-weight: 900; font-size: 0.6rem; margin-top: 0.5rem; color: #121212; }

                /* PARTICLES */
                .particle { position: absolute; width: 14px; height: 14px; border: 2.5px solid black; left: -7px; }
                .red-bg { background: var(--primary-red); }
                .blue-bg { background: var(--primary-blue); }
                .triangle-up { 
                    width: 0; height: 0; border: none; background: transparent;
                    border-left: 7px solid transparent; border-right: 7px solid transparent; 
                    border-bottom: 14px solid var(--primary-blue);
                }
                .move-down-1 { animation: slide-down 1.2s infinite linear; }
                .move-down-2 { animation: slide-down 1.2s infinite linear .6s; }
                @keyframes slide-down { 0% { top: -20px; opacity: 1; } 100% { top: 100%; opacity: 0; } }

                .fusion-node-v3 { margin-top: 1rem; padding: 1rem 3rem; display: flex; flex-direction: column; align-items: center; gap: 0.5rem; }
                .fusion-label { font-weight: 900; font-size: 0.8rem; }
                .spinner-bauhaus { width: 25px; height: 25px; border: 4px solid black; border-top-color: white; border-radius: 50%; animation: rotate 1s infinite linear; }
                @keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

                /* TICKER FOOTER */
                .explainer-footer {
                    position: fixed; bottom: 3rem; width: 700px; max-width: 90vw; background: white;
                    display: flex; align-items: stretch; height: 60px; overflow: hidden;
                }
                .ticker-label { padding: 0 1.5rem; display: flex; align-items: center; color: white; font-weight: 900; font-size: 0.7rem; letter-spacing: 0.1em; }
                .ticker-content { flex-grow: 1; padding: 0 2rem; display: flex; align-items: center; position: relative; }
                .ticker-text-wrapper { font-weight: 900; font-size: 1.1rem; color: black; letter-spacing: -0.02em; transition: 0.5s; opacity: 0; transform: translateY(20px); }
                .ticker-text-wrapper.active { opacity: 1; transform: translateY(0); }

                @media (max-width: 750px) {
                    .explainer-footer { width: 95vw; height: auto; flex-direction: column; }
                    .ticker-label { padding: 0.5rem; }
                    .ticker-content { padding: 1.5rem; }
                    .heading-xl { font-size: 2rem; }
                }
            `}</style>
        </div>
    );
};

export default LoadingScreen;
