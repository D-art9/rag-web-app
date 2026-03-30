import React from 'react';
import { Share2, Zap, Database, Cpu, Search, Activity } from 'lucide-react';

const Dataflow: React.FC = () => {
    const steps = [
        { icon: <Share2 />, title: '01_INGESTION', desc: 'Secure DNA extraction via Python Bridge (yt-dlp) and Localtunnel.' },
        { icon: <Activity />, title: '02_EXTRACTION', desc: 'Dialect-aware transcript retrieval with Fuzzy-Language-Bridge logic (en-IN/GB/US).' },
        { icon: <Database />, title: '03_VECTORIZATION', desc: 'Cloud-TPU batch embedding using gemini-embedding-001 (TPU Optimized).' },
        { icon: <Search />, title: '04_NEURAL_RECALL', desc: 'Cosine similarity recall with hard-filtered bias for ultra-low hallucinations.' },
        { icon: <Cpu />, title: '05_SYNTHESIS', desc: 'Multimodal reasoning engine powered by Gemini 2.5 Flash Core.' },
        { icon: <Zap />, title: '06_STREAM_FLUIDITIY', desc: 'Real-time SSE event delivery with non-blocking auto-scroll containment.' }
    ];

    return (
        <div className="scroll-panel" style={{ padding: 'var(--grid-gap)' }}>
            <div className="industrial-label" style={{ marginBottom: '40px', fontSize: '18px' }}>05_SYSTEM_SCHEMATICS</div>
            
            <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {steps.map((step, i) => (
                    <React.Fragment key={i}>
                        <div className="glass-card" style={{ 
                            display: 'flex', gap: '24px', alignItems: 'center',
                            borderLeft: '4px solid var(--accent-cyan)'
                        }}>
                            <div style={{ color: 'var(--accent-cyan)', opacity: 0.8 }}>
                                {step.icon}
                            </div>
                            <div>
                                <div className="industrial-label" style={{ margin: 0, color: 'white' }}>{step.title}</div>
                                <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>{step.desc}</p>
                            </div>
                            <div style={{ marginLeft: 'auto', fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                                STEP_0{i + 1}
                            </div>
                        </div>
                        {i < steps.length - 1 && (
                            <div style={{ 
                                height: '24px', width: '2px', background: 'var(--border-light)', 
                                margin: '0 44px', borderLeft: '1px dashed rgba(0,242,255,0.2)' 
                            }} />
                        )}
                    </React.Fragment>
                ))}
            </div>

            <div className="glass-card" style={{ marginTop: '60px', opacity: 0.5, textAlign: 'center' }}>
                <div className="industrial-label">HARDWARE_LOCK: VERIFIED</div>
                <p style={{ fontSize: '11px' }}>System running on unified Render Cloud with Persistent Python Extractor Tunnel.</p>
            </div>
        </div>
    );
};

export default Dataflow;
