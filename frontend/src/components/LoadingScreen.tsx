import React from 'react';

interface LoadingScreenProps {
    message?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ message = "SYSTEM_INGESTION_ACTIVE" }) => {
    return (
        <div className="bauhaus-loading-v2">
            
            {/* INFOGRAPHIC HEADER */}
            <header className="ingest-header">
                <h1 className="heading-lg">SCRIPTYT_DATAFLOW</h1>
                <div className="status-label bauhaus-border">NEURAL_SYNC: ON</div>
            </header>

            {/* THE KINETIC FLOW CHART */}
            <div className="flow-canvas">
                
                {/* SOURCE POINT */}
                <div className="source-node bauhaus-border">
                    <div className="node-label">SOURCE_YOUTUBE</div>
                </div>

                {/* THE SPLIT DRAIN */}
                <div className="flow-main-line"></div>

                <div className="pipeline-split">
                    {/* AUDIO STREAM */}
                    <div className="stream stream-audio">
                         <div className="stream-line line-red">
                             <div className="particle circle red-bg move-down-1"></div>
                             <div className="particle square red-bg move-down-2"></div>
                         </div>
                         <div className="stream-label">P1_AUDIO_TRANSCRIPT</div>
                    </div>

                    {/* VISION STREAM */}
                    <div className="stream stream-vision">
                         <div className="stream-line line-blue">
                             <div className="particle circle blue-bg move-down-2"></div>
                             <div className="particle triangle-up blue-bg move-down-1"></div>
                         </div>
                         <div className="stream-label">P2_VISION_METADATA</div>
                    </div>
                </div>

                {/* DATA FUSION POINT */}
                <div className="fusion-node bauhaus-border btn-yellow bauhaus-shadow-sm">
                    <div className="fusion-label">FUSION_VECTOR_DB</div>
                    <div className="spinner-bauhaus"></div>
                </div>

                <div className="flow-msg">{message.toUpperCase()}</div>
            </div>

            <style>{`
                .bauhaus-loading-v2 {
                    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
                    background: #F0F0F0; z-index: 1000;
                    display: flex; flex-direction: column; align-items: center; justify-content: center;
                    font-family: 'Outfit', sans-serif;
                }

                .ingest-header { text-align: center; margin-bottom: 3rem; }
                .status-label { display: inline-block; padding: 0.5rem 2rem; font-weight: 900; background: white; margin-top: 1rem; }

                /* FLOW CHART */
                .flow-canvas { display: flex; flex-direction: column; align-items: center; position: relative; }

                .source-node { 
                    padding: 1rem 3rem; background: white; font-weight: 900; 
                    box-shadow: 4px 4px 0px black; z-index: 10;
                }

                .flow-main-line { width: 4px; height: 50px; background: black; }

                .pipeline-split { display: flex; gap: 10rem; position: relative; }
                .pipeline-split::before {
                    content: ''; position: absolute; top: 0; left: 50%; 
                    width: 10rem; height: 4px; background: black; transform: translateX(-50%);
                }

                .stream { display: flex; flex-direction: column; align-items: center; position: relative; }
                .stream-line { width: 4px; height: 150px; background: black; position: relative; overflow: hidden; }
                .stream-label { font-weight: 900; font-size: 0.7rem; margin-top: 1rem; letter-spacing: 0.1em; }

                .line-red { border-color: var(--primary-red); }
                .line-blue { border-color: var(--primary-blue); }

                /* ANIMATED PARTICLES */
                .particle { position: absolute; width: 12px; height: 12px; border: 2px solid black; left: -6px; }
                .red-bg { background: var(--primary-red); }
                .blue-bg { background: var(--primary-blue); }
                .triangle-up { 
                    width: 0; height: 0; border: none; background: transparent;
                    border-left: 6px solid transparent; border-right: 6px solid transparent; 
                    border-bottom: 12px solid var(--primary-blue);
                }

                .move-down-1 { animation: slide-down 1.5s infinite linear; }
                .move-down-2 { animation: slide-down 1.5s infinite linear .7s; }

                @keyframes slide-down {
                    0% { top: -20px; opacity: 1; }
                    100% { top: 100%; opacity: 0; }
                }

                .fusion-node { 
                    margin-top: 2rem; padding: 1.5rem 4rem; 
                    display: flex; flex-direction: column; align-items: center; gap: 1rem;
                }
                .fusion-label { font-weight: 900; font-size: 1rem; }

                .spinner-bauhaus {
                    width: 30px; height: 30px; border: 4px solid black;
                    border-top-color: white; border-radius: 50%;
                    animation: rotate 1s infinite linear;
                }

                @keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

                .flow-msg { margin-top: 2rem; font-weight: 900; color: #666; font-size: 0.8rem; letter-spacing: 0.3em; }

                @media (max-width: 600px) {
                    .pipeline-split { gap: 4rem; }
                    .pipeline-split::before { width: 4rem; }
                }
            `}</style>
        </div>
    );
};

export default LoadingScreen;
