import React, { useState, useEffect, useRef } from 'react';

interface LoadingScreenProps {
    isFinished?: boolean;
    onAnimationComplete?: () => void;
    message?: string;
}

const STEPS = [
    { text: "INITIATING_SCRIPTYT_CORE_v2.1", type: "system" },
    { text: "CONNECTING_TO_EXTRACTOR_NODE_04...", type: "system" },
    { text: "RESOLVING_YOUTUBE_API_TOKENS...", type: "info" },
    { text: "STATUS: [RESOLVED]", type: "ok" },
    { text: "ATTACHING_YT_DLP_DECODER...", type: "info" },
    { text: "FETCHING_TRANSCRIPT_BLOB... [48kb]", type: "info" },
    { text: "PARSING_TEXT_SEGMENTS...", type: "system" },
    { text: "UPDATING_SEMANTIC_INDEX...", type: "system" },
    { text: "LLM_SERVICE: [HANDSHAKE_OK]", type: "ok" },
    { text: "FINALIZING_PIPELINE_HANDSHAKE...", type: "system" },
    { text: "SYSTEM_READY: [DASHBOARD_LIVE]", type: "ok" }
];

const LoadingScreen: React.FC<LoadingScreenProps> = ({ isFinished, onAnimationComplete, message }) => {
    const [progress, setProgress] = useState(0);
    const [logs, setLogs] = useState<string[]>([]);
    const logEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let index = 0;
        const logInterval = setInterval(() => {
            if (index < STEPS.length) {
                const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
                const logLine = `[${timestamp}] ${STEPS[index].text}`;
                setLogs(prev => [...prev, logLine]);
                index++;
                setProgress(Math.round((index / STEPS.length) * 100));
            } else {
                clearInterval(logInterval);
                if (isFinished && onAnimationComplete) onAnimationComplete();
            }
        }, 150);

        return () => clearInterval(logInterval);
    }, [isFinished, onAnimationComplete]);

    useEffect(() => {
        logEndRef.current?.scrollIntoView({ behavior: "auto" });
    }, [logs]);

    return (
        <div className="terminal-loading">
            <div className="crt-overlay" />
            
            <div className="loading-content pane">
                <div className="pane-header">
                  <span>SYSTEM_LOAD: /bin/scriptyt_boot</span>
                  <span>{progress}%</span>
                </div>
                
                <div className="log-window">
                    <pre className="ascii-art">{`
  #####  #####  ######  #####  #######
 #     # #     # #     # #    #    #   
 #       #     # #     # #    #    #   
  #####  #     # ######  #####     #   
       # #     # #   #   #         #   
 #     # #     # #    #  #         #   
  #####  #####  #     # #         #
                    `}</pre>
                    
                    <div className="scrolling-logs">
                        {logs.map((log, i) => (
                            <div key={i} className="log-line">&gt; {log}</div>
                        ))}
                        {message && <div className="log-line active">&gt; {message}</div>}
                        <div ref={logEndRef} />
                    </div>
                </div>

                <div className="progress-bar-container">
                    <div className="progress-label">INITIALIZATION_PROGRESS: {progress}%</div>
                    <div className="progress-bar-outer">
                        <div className="progress-bar-inner" style={{ width: `${progress}%` }} />
                    </div>
                </div>
            </div>

            <style>{`
                .terminal-loading {
                    position: fixed;
                    inset: 0;
                    background: var(--bg-color);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 2rem;
                    z-index: 10000;
                }

                .loading-content {
                    width: 100%;
                    max-width: 800px;
                    height: 500px;
                    display: flex;
                    flex-direction: column;
                }

                .log-window {
                    flex-grow: 1;
                    padding: 2rem;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                }

                .ascii-art {
                    font-size: 0.6rem;
                    color: var(--primary-color);
                    margin-bottom: 2rem;
                    text-shadow: var(--text-glow);
                }

                .scrolling-logs {
                    flex-grow: 1;
                    overflow-y: auto;
                    font-family: var(--font-mono);
                    font-size: 0.8rem;
                    color: var(--muted-color);
                    display: flex;
                    flex-direction: column;
                    gap: 0.2rem;
                }

                .log-line.active {
                    color: var(--primary-color);
                    font-weight: bold;
                }

                .progress-bar-container {
                    padding: 1.5rem 2rem;
                    border-top: 1px dashed var(--border-color);
                }

                .progress-label {
                    font-size: 0.7rem;
                    margin-bottom: 0.5rem;
                    color: var(--muted-color);
                }

                .progress-bar-outer {
                    height: 12px;
                    width: 100%;
                    border: 1px solid var(--border-color);
                    padding: 2px;
                }

                .progress-bar-inner {
                    height: 100%;
                    background: var(--primary-color);
                    box-shadow: var(--glow-shadow);
                }
            `}</style>
        </div>
    );
};

export default LoadingScreen;
