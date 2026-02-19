import React, { useState } from 'react';
import UploadForm from '../components/UploadForm';
import GraphView from '../components/GraphView';
import FraudRingTable from '../components/FraudRingTable';
import SuspiciousTable from '../components/SuspiciousTable';
import DownloadButton from '../components/DownloadButton';

const Home = () => {
    const [results, setResults] = useState(null);

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
            <h1 style={{ textAlign: 'center', marginBottom: '30px', color: '#333' }}>Graph-Based Financial Crime Detection Engine</h1>

            <UploadForm onUploadSuccess={setResults} />

            {results && (
                <div className="results-container">
                    {/* Summary Section */}
                    <div style={{ display: 'flex', justifyContent: 'space-around', margin: '20px 0', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                        <div><strong>Accounts Analyzed:</strong> {results.summary.total_accounts_analyzed}</div>
                        <div><strong>Suspicious Flagged:</strong> {results.summary.suspicious_accounts_flagged}</div>
                        <div><strong>Rings Detected:</strong> {results.summary.fraud_rings_detected}</div>
                        <div><strong>Time:</strong> {results.summary.processing_time_seconds}s</div>
                    </div>

                    <DownloadButton data={results} />

                    <GraphView data={results} />

                    <SuspiciousTable accounts={results.suspicious_accounts} />

                    <FraudRingTable rings={results.fraud_rings} />
                </div>
            )}
        </div>
    );
};

export default Home;
