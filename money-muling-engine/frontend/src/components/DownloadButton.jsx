import React from 'react';
import { Download, FileJson } from 'lucide-react';

const DownloadButton = ({ data }) => {
    if (!data) return null;

    const handleDownload = () => {
        // Strip extra fields (first_seen, last_seen) to match exact spec format
        const cleanData = {
            ...data,
            suspicious_accounts: data.suspicious_accounts.map(({ first_seen, last_seen, ...rest }) => rest),
        };
        const jsonString = JSON.stringify(cleanData, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = 'fraud_detection_results.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <button
            id="download-json-btn"
            onClick={handleDownload}
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                padding: '12px 28px',
                borderRadius: 'var(--radius-full)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                background: 'rgba(16, 185, 129, 0.06)',
                color: '#6ee7b7',
                fontSize: '0.875rem',
                fontWeight: 600,
                fontFamily: 'var(--font-primary)',
                cursor: 'pointer',
                transition: 'all var(--transition-base)',
            }}
            onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(16, 185, 129, 0.12)';
                e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.4)';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(16, 185, 129, 0.12)';
            }}
            onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(16, 185, 129, 0.06)';
                e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.25)';
                e.currentTarget.style.boxShadow = 'none';
            }}
        >
            <FileJson size={18} />
            Download JSON Report
            <Download size={16} />
        </button>
    );
};

export default DownloadButton;
