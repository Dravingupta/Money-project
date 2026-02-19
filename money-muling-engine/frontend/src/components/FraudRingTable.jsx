import React from 'react';

const FraudRingTable = ({ rings }) => {
    if (!rings || rings.length === 0) return null;

    return (
        <div style={{ marginTop: '30px' }}>
            <h3>Detected Fraud Rings</h3>
            <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                    <tr style={{ backgroundColor: '#f2f2f2' }}>
                        <th>Ring ID</th>
                        <th>Pattern Type</th>
                        <th>Member Count</th>
                        <th>Risk Score</th>
                        <th>Member Accounts</th>
                    </tr>
                </thead>
                <tbody>
                    {rings.map((ring) => (
                        <tr key={ring.ring_id}>
                            <td>{ring.ring_id}</td>
                            <td>{ring.pattern_type}</td>
                            <td>{ring.member_accounts.length}</td>
                            <td>{ring.risk_score}</td>
                            <td>{ring.member_accounts.join(', ')}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default FraudRingTable;
