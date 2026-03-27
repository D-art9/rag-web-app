import React, { useState } from 'react';
import { Search, ArrowRight, Activity, Percent } from 'lucide-react';

interface SearchResult {
    text: string;
    score: number;
    videoId: string;
    title: string;
    thumbnail: string;
    url: string;
}

interface SearchPlaygroundProps {
    onResultClick: (videoId: string, url: string, title: string, thumbnail: string) => void;
}

const SearchPlayground: React.FC<SearchPlaygroundProps> = ({ onResultClick }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim() || isSearching) return;

        setIsSearching(true);
        try {
            const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://scriptyt-test-laptop.loca.lt/api';
            const response = await fetch(`${API_BASE_URL}/search?q=${encodeURIComponent(query)}`);
            const data = await response.json();
            setResults(data.results || []);
        } catch (err) {
            console.error('SEARCH_FAULT:', err);
        } finally {
            setIsSearching(false);
        }
    };

    return (
        <div className="bauhaus-playground">
            {/* HERO SEARCH BLOCK */}
            <section className="search-header-block bauhaus-border btn-yellow bauhaus-shadow">
                <h1 className="heading-lg">SEMANTIC_EXPLORER_v2.1</h1>
                <form onSubmit={handleSearch} className="playground-form">
                    <div className="input-wrapper bauhaus-border">
                        <Search className="search-icon" size={32} />
                        <input 
                            type="text" 
                            className="playground-input" 
                            placeholder="SEARCH_CONCEPTS_ACROSS_ALL_SOURCES..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                    </div>
                    <button type="submit" className="btn-search-trigger btn-red bauhaus-border" disabled={isSearching}>
                        {isSearching ? 'SCANN_INDEX...' : 'INIT_SEARCH'}
                    </button>
                </form>
            </section>

            {/* RESULTS GRID */}
            <div className="search-grid">
                {results.length > 0 ? (
                    results.map((res, i) => (
                        <div key={i} className="search-card bauhaus-border bauhaus-shadow-sm" onClick={() => onResultClick(res.videoId, res.url, res.title, res.thumbnail)}>
                            <div className="card-header bg-blue">
                                <span className="score-badge"><Percent size={12}/> {(res.score * 100).toFixed(1)}%_MATCH</span>
                                <span className="video-tag">SOURCE: {res.title.substring(0, 15)}...</span>
                            </div>
                            
                            <div className="card-body">
                                <div className="card-thumb bauhaus-border">
                                    <img src={res.thumbnail} alt="THUMB" />
                                </div>
                                <p className="card-text">"{res.text.substring(0, 250)}..."</p>
                                <div className="card-footer">
                                    <span className="source-label">VIDEO_ID: {res.videoId.substring(0, 8)}</span>
                                    <ArrowRight className="jump-icon" />
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="empty-playground bauhaus-border">
                        <Activity size={48} className="empty-icon" />
                        <h3 className="heading-sm">SYSTEM_READY</h3>
                        <p>ENTER A QUERY TO PERFORM A GLOBAL SCAN.</p>
                    </div>
                )}
            </div>

            <style>{`
                .bauhaus-playground { display: flex; flex-direction: column; gap: 4rem; padding-bottom: 5rem; }

                .search-header-block { padding: 4rem; display: flex; flex-direction: column; gap: 2rem; }

                .playground-form { display: flex; gap: 1rem; }

                .input-wrapper { 
                    flex-grow: 1; display: flex; align-items: center; padding: 0 1.5rem; 
                    background: white; gap: 1rem;
                }

                .playground-input { 
                    flex-grow: 1; border: none; outline: none; padding: 2rem 0;
                    font-weight: 900; font-size: 1.5rem; font-family: inherit;
                }

                .btn-search-trigger { padding: 0 3rem; font-weight: 900; color: white; cursor: pointer; text-transform: uppercase; }

                /* GRID */
                .search-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
                    gap: 3rem;
                }

                .search-card { 
                    background: white; cursor: pointer; transition: transform 0.2s; 
                    display: flex; flex-direction: column;
                }
                .search-card:hover { transform: translateY(-5px); }

                .card-header { 
                    padding: 0.8rem 1.5rem; color: white; font-weight: 900; 
                    display: flex; justify-content: space-between; align-items: center;
                    font-size: 0.7rem; letter-spacing: 0.1em;
                }

                .card-body { padding: 1.5rem; display: flex; flex-direction: column; gap: 1rem; }

                .card-thumb { overflow: hidden; height: 150px; }
                .card-thumb img { width: 100%; height: 100%; object-fit: cover; filter: grayscale(100%); transition: 0.3s; }
                .search-card:hover .card-thumb img { filter: grayscale(0%); }

                .card-text { font-size: 0.9rem; font-weight: 500; line-height: 1.4; color: #333; height: 80px; overflow: hidden; }

                .card-footer { 
                    margin-top: 1rem; padding-top: 1rem; border-top: 2px solid #eee;
                    display: flex; justify-content: space-between; align-items: center;
                    font-weight: 900; font-size: 0.7rem; color: #999;
                }

                .empty-playground { grid-column: 1 / -1; padding: 5rem; text-align: center; }
                .empty-icon { margin: 0 auto 1.5rem; color: var(--primary-red); }
                .heading-sm { font-weight: 900; font-size: 2rem; margin-bottom: 1rem; }

                @media (max-width: 800px) {
                    .playground-form { flex-direction: column; }
                    .search-header-block { padding: 2rem; }
                }
            `}</style>
        </div>
    );
};

export default SearchPlayground;
