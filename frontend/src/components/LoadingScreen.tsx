import React, { useState, useEffect } from 'react';

interface LoadingScreenProps {
    message?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ message = "EXTRACTING_KNOWLEDGE" }) => {
    return (
        <div className="bauhaus-loading">
            {/* GEOMETRIC COMPOSITION */}
            <div className="loading-composition">
                <div className="shape circle blue-bg pulse-anim"></div>
                <div className="shape square red-bg rotate-anim"></div>
                <div className="shape triangle-up yellow-bg float-anim"></div>
            </div>

            <div className="loading-content">
                <h1 className="heading-lg">{message.toUpperCase()}</h1>
                <div className="status-bar bauhaus-border">
                    <div className="bar-progress"></div>
                </div>
                <p className="loading-meta">NEURAL_SYNC_v1.0.0 [ACTIVE]</p>
            </div>

            <style>{`
                .bauhaus-loading {
                    height: 100vh;
                    width: 100vw;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    background: #F0F0F0;
                    overflow: hidden;
                    text-align: center;
                }

                .loading-composition {
                    position: relative;
                    width: 300px;
                    height: 300px;
                    margin-bottom: 4rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .shape {
                    position: absolute;
                    width: 150px;
                    height: 150px;
                    border: 4px solid black;
                }

                .blue-bg { background: var(--primary-blue); border-radius: 999px; left: 0; }
                .red-bg { background: var(--primary-red); right: 0; }
                .yellow-bg { 
                    width: 0; height: 0; 
                    border-left: 75px solid transparent;
                    border-right: 75px solid transparent;
                    border-bottom: 130px solid var(--primary-yellow);
                    background: transparent;
                    border: none;
                    filter: drop-shadow(4px 4px 0px black);
                    top: 0;
                }

                .pulse-anim { animation: pulse 2s infinite ease-in-out; }
                .rotate-anim { animation: rotate 3s infinite linear; }
                .float-anim { animation: float 1.5s infinite ease-in-out; }

                @keyframes pulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.2); }
                }

                @keyframes rotate {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }

                @keyframes float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-30px); }
                }

                .loading-content {
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                    align-items: center;
                }

                .status-bar {
                    width: 400px;
                    height: 10px;
                    background: white;
                    position: relative;
                }

                .bar-progress {
                    position: absolute;
                    top: 0; left: 0; bottom: 0;
                    background: var(--primary-red);
                    animation: fill 3s infinite ease-in-out;
                }

                @keyframes fill {
                    0% { width: 0; }
                    50% { width: 100%; left: 0; }
                    100% { width: 0; left: 100%; }
                }

                .loading-meta {
                    font-weight: 900;
                    font-size: 0.8rem;
                    letter-spacing: 0.2em;
                    color: #666;
                }
            `}</style>
        </div>
    );
};

export default LoadingScreen;
