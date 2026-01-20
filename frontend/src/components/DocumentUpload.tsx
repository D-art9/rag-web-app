import React, { useState } from 'react';

const DocumentUpload: React.FC = () => {
    const [url, setUrl] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleUpload = async () => {
        setIsUploading(true);
        setError(null);

        try {
            // Placeholder for API call to upload the YouTube URL
            // await api.uploadTranscript(url);
            console.log('Uploading URL:', url);
        } catch (err) {
            setError('Failed to upload the document. Please try again.');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div>
            <h2>Upload YouTube Video URL</h2>
            <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Enter YouTube video URL"
            />
            <button onClick={handleUpload} disabled={isUploading}>
                {isUploading ? 'Uploading...' : 'Upload'}
            </button>
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
};

export default DocumentUpload;