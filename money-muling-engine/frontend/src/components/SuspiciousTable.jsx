import React from 'react';

const SuspiciousTable = ({ accounts }) => {
    if (!accounts || accounts.length === 0) return null;

    return (
        <div style={{ marginTop: '30px' }}>
            <h3>Suspicious Accounts (High Risk)</h3>
            <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                    <tr style={{ backgroundColor: '#f2f2f2' }}>
                        <th>Account ID</th>
                        <th>Suspicion Score</th>
                        <th>Detected Patterns</th>
                        <th>Ring ID</th>
                    </tr>
                </thead>
                <tbody>
                    {accounts.map((acc) => (
                        <tr key={acc.account_id}>
                            <td style={{ fontWeight: 'bold' }}>{acc.account_id}</td>
                            <td style={{ color: acc.suspicion_score > 70 ? 'red' : 'orange' }}>{acc.suspicion_score}</td>
                            <td>{acc.detected_patterns.join(', ')}</td>
                            <td>{acc.ring_id || '-'}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default SuspiciousTable;
