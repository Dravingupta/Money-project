import React, { useState } from 'react';
import apiClient from '../api/apiClient';

const UploadForm = ({ onUploadSuccess }) => {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setError(null);
        setMessage(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            setError('Please select a CSV file.');
            return;
        }

        setLoading(true);
        setError(null);
        setMessage(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await apiClient.post('/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setMessage('Analysis complete!');
            onUploadSuccess(response.data);
        } catch (err) {
            console.error(err);
            const errorMessage = err.response?.data?.error || err.message || 'Upload failed.';
            const details = err.response?.data?.details;
            setError(details ? `${errorMessage}: ${details.join(', ')}` : errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="upload-container" style={{ padding: '20px', border: '1px dashed #ccc', borderRadius: '8px', textAlign: 'center', marginBottom: '20px' }}>
            <form onSubmit={handleSubmit}>
                <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    disabled={loading}
                    style={{ marginBottom: '10px' }}
                />
                <br />
                <button
                    type="submit"
                    disabled={!file || loading}
                    style={{ padding: '10px 20px', cursor: loading ? 'not-allowed' : 'pointer' }}
                >
                    {loading ? 'Analyzing...' : 'Upload & Analyze'}
                </button>
            </form>
            {loading && <p style={{ color: 'blue' }}>Processing transaction graph...</p>}
            {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
            {message && <p style={{ color: 'green', marginTop: '10px' }}>{message}</p>}
        </div>
    );
};

export default UploadForm;
