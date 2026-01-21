import React, { useState, useEffect } from 'react';

interface LoadingScreenProps {
    isFinished: boolean;
    onAnimationComplete: () => void;
}

const STEPS = [
    { text: "Initializing connection...", threshold: 10 },
    { text: "Resolving YouTube URL...", threshold: 20 },
    { text: "Downloading video content...", threshold: 40 },
    { text: "Extracting audio track...", threshold: 50 },
    { text: "Transcribing with Whisper...", threshold: 70 },
    { text: "Generating vector embeddings...", threshold: 85 },
    { text: "Indexing knowledge base...", threshold: 90 },
    { text: "Finalizing pipeline...", threshold: 95 }
];

const LoadingScreen: React.FC<LoadingScreenProps> = ({ isFinished, onAnimationComplete }) => {
    const [progress, setProgress] = useState(0);
    const [currentStep, setCurrentStep] = useState(0);

    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (isFinished) {
            // Fast forward to 100%
            setProgress(100);
            setTimeout(() => {
                onAnimationComplete();
            }, 800); // Wait a bit at 100% before navigating
        } else {
            // Simulated progress up to 90%
            interval = setInterval(() => {
                setProgress(prev => {
                    const next = prev + (Math.random() * 2);

                    // Slow down as we approach 90%
                    if (next > 90) return 90 + (Math.random() * 0.1); // Crawl very slowly at 90

                    // Update step text based on progress
                    const stepIndex = STEPS.findIndex(s => s.threshold > prev);
                    if (stepIndex !== -1) setCurrentStep(stepIndex);

                    return next;
                });
            }, 100);
        }

        return () => clearInterval(interval);
    }, [isFinished, onAnimationComplete]);

    return (
        <div style={styles.container} className="fade-in">
            <div style={styles.content}>
                {/* Spinner / Icon */}
                <div style={styles.iconWrapper}>
                    <div style={styles.pulseRing}></div>
                    <div style={styles.logo}>⚡</div>
                </div>

                <h2 style={styles.title}>Processing Content</h2>

                <div style={styles.barContainer}>
                    <div style={{ ...styles.barFill, width: `${progress}%` }}></div>
                </div>

                <div style={styles.meta}>
                    <span style={styles.percentage}>{Math.round(progress)}%</span>
                    <span style={styles.stepText}>
                        {isFinished ? "Complete!" : STEPS[currentStep]?.text || "Processing..."}
                    </span>
                </div>

                {/* Pipeline visualizer (optional cool extra) */}
                <div style={styles.pipeline}>
                    <div style={{ ...styles.node, opacity: progress > 20 ? 1 : 0.3 }}>YT</div>
                    <div style={{ ...styles.line, width: progress > 35 ? '40px' : '0px' }}></div>
                    <div style={{ ...styles.node, opacity: progress > 50 ? 1 : 0.3 }}>Audio</div>
                    <div style={{ ...styles.line, width: progress > 70 ? '40px' : '0px' }}></div>
                    <div style={{ ...styles.node, opacity: progress > 85 ? 1 : 0.3 }}>AI</div>
                    <div style={{ ...styles.line, width: progress > 95 ? '40px' : '0px' }}></div>
                    <div style={{ ...styles.node, opacity: progress >= 100 ? 1 : 0.3 }}>DB</div>
                </div>
            </div>
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    container: {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(5, 10, 20, 0.95)',
        backdropFilter: 'blur(15px)',
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        width: '100%',
        maxWidth: '500px',
        padding: '3rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '2rem',
    },
    iconWrapper: {
        position: 'relative',
        marginBottom: '1rem',
    },
    pulseRing: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        border: '2px solid var(--accent-color)',
        animation: 'pulse 2s infinite',
        opacity: 0.5,
    },
    logo: {
        fontSize: '3rem',
        position: 'relative',
        zIndex: 2,
    },
    title: {
        color: 'white',
        fontSize: '2rem',
        fontWeight: 700,
        margin: 0,
        letterSpacing: '-1px',
    },
    barContainer: {
        width: '100%',
        height: '6px',
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '100px',
        overflow: 'hidden',
    },
    barFill: {
        height: '100%',
        background: 'linear-gradient(90deg, var(--accent-color), #ff00cc)',
        borderRadius: '100px',
        transition: 'width 0.2s ease-out',
        boxShadow: '0 0 20px rgba(230, 57, 70, 0.5)',
    },
    meta: {
        width: '100%',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        color: 'var(--text-secondary)',
        fontSize: '0.9rem',
        fontFamily: 'monospace',
    },
    percentage: {
        color: 'white',
        fontWeight: 700,
    },
    stepText: {
        color: 'var(--accent-color)',
    },
    pipeline: {
        display: 'flex',
        alignItems: 'center',
        marginTop: '2rem',
        gap: '0.5rem',
    },
    node: {
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '0.7rem',
        fontWeight: 700,
        color: 'white',
        transition: 'all 0.5s',
    },
    line: {
        height: '2px',
        background: 'var(--accent-color)',
        transition: 'width 0.5s ease-out',
        width: '0px'
        // width handled by state
    }
};

export default LoadingScreen;
