import React from 'react';

const SearchResults: React.FC<{ results: any[] }> = ({ results }) => {
    return (
        <div>
            <h2>Search Results</h2>
            {results.length === 0 ? (
                <p>No results found.</p>
            ) : (
                <ul>
                    {results.map((result, index) => (
                        <li key={index}>
                            <h3>{result.title}</h3>
                            <p>{result.description}</p>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default SearchResults;