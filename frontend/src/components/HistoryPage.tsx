import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { Play, Trash2, Calendar, Clock } from 'lucide-react';

interface Document {
    _id: string;
    url: string;
    title: string;
    thumbnail: string;
    createdAt: string;
}

interface HistoryPageProps {
    onSelectVideo: (id: string, url: string) => void;
}

const HistoryPage: React.FC<HistoryPageProps> = ({ onSelectVideo }) => {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);

    const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://scriptyt-test-laptop.loca.lt/api';

    const fetchHistory = useCallback(async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/documents`);
            setDocuments(res.data.documents || []);
        } catch (err) {
            console.error('[HISTORY_FETCH_FAILED]', err);
        } finally {
            setLoading(false);
        }
    }, [API_BASE_URL]);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (!window.confirm('PERMANENTLY_DELETE_DNA_SEQUENCE?')) return;
        try {
            await axios.delete(`${API_BASE_URL}/documents/${id}`);
            setDocuments(prev => prev.filter(d => d._id !== id));
        } catch (err) {
            console.error('[DELETE_FAILED]', err);
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <div className="industrial-label">INITIALIZING_HISTORY_QUERY...</div>
            </div>
        );
    }

    return (
        <div className="scroll-panel" style={{ padding: 'var(--grid-gap)' }}>
            <div className="industrial-label" style={{ marginBottom: '40px', fontSize: '18px' }}>04_NEURAL_REGISTRY</div>
            
            {documents.length === 0 ? (
                <div className="glass-card" style={{ textAlign: 'center', padding: '100px' }}>
                    <div className="industrial-label">REGISTRY_EMPTY</div>
                    <p style={{ color: 'var(--text-muted)' }}>No previous extractions detected in the cloud vault.</p>
                </div>
            ) : (
                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
                    gap: 'var(--grid-gap)' 
                }}>
                    {documents.map((doc) => (
                        <div 
                            key={doc._id} 
                            className="glass-card history-card"
                            onClick={() => onSelectVideo(doc._id, doc.url)}
                            style={{ cursor: 'pointer', padding: '12px' }}
                        >
                            <div style={{ position: 'relative', borderRadius: '4px', overflow: 'hidden', marginBottom: '16px' }}>
                                <img 
                                    src={doc.thumbnail || `https://img.youtube.com/vi/${doc.url.split('v=')[1]?.split('&')[0]}/mqdefault.jpg`} 
                                    alt={doc.title} 
                                    style={{ width: '100%', display: 'block', transition: '0.4s' }}
                                    className="history-thumb"
                                />
                                <div className="history-play-overlay">
                                    <Play fill="white" size={32} />
                                </div>
                            </div>
                            
                            <div style={{ fontWeight: 800, fontSize: '14px', marginBottom: '8px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                {doc.title || 'UNTITLED_DNA_SEQUENCE'}
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                                <div style={{ display: 'flex', gap: '12px', color: 'var(--text-muted)', fontSize: '10px' }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <Calendar size={10} /> {new Date(doc.createdAt).toLocaleDateString()}
                                    </span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <Clock size={10} /> {new Date(doc.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <button 
                                    onClick={(e) => handleDelete(e, doc._id)}
                                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', opacity: 0.5 }}
                                    className="delete-btn"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <style>{`
                .history-card:hover .history-thumb {
                    transform: scale(1.05);
                    filter: brightness(0.6);
                }
                .history-play-overlay {
                    position: absolute; top: 0; left: 0; right: 0; bottom: 0;
                    display: flex; align-items: center; justifyContent: center;
                    opacity: 0; transition: 0.4s;
                }
                .history-card:hover .history-play-overlay { opacity: 1; }
                .delete-btn:hover { color: var(--accent-red) !important; opacity: 1 !important; }
            `}</style>
        </div>
    );
};

export default HistoryPage;
