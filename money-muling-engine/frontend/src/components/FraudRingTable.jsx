import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Users, TrendingUp } from 'lucide-react';

const patternIcons = {
    cycle: <AlertTriangle size={16} />,
    smurfing_fan_in: <TrendingUp size={16} />,
    smurfing_fan_out: <TrendingUp size={16} style={{ transform: 'scaleX(-1)' }} />,
    shell_network: <Users size={16} />,
};

const patternLabels = {
    cycle: 'Circular Routing',
    smurfing_fan_in: 'Fan-In Smurfing',
    smurfing_fan_out: 'Fan-Out Smurfing',
    shell_network: 'Shell Network',
};

const getRiskColor = (score) => {
    if (score >= 70) return { bg: 'rgba(239, 68, 68, 0.12)', border: 'rgba(239, 68, 68, 0.3)', text: '#fca5a5', glow: 'var(--glass-glow-red)' };
    if (score >= 40) return { bg: 'rgba(249, 115, 22, 0.12)', border: 'rgba(249, 115, 22, 0.3)', text: '#fdba74', glow: 'none' };
    return { bg: 'rgba(245, 158, 11, 0.12)', border: 'rgba(245, 158, 11, 0.3)', text: '#fcd34d', glow: 'none' };
};

const FraudRingTable = ({ rings }) => {
    if (!rings || rings.length === 0) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            style={{ marginBottom: 'var(--section-gap)' }}
        >
            <div style={{ marginBottom: 16 }}>
                <h2 style={{ fontSize: '1.25rem', color: 'var(--text-primary)' }}>
                    Detected Fraud Rings
                </h2>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>
                    {rings.length} ring{rings.length !== 1 ? 's' : ''} identified across all pattern types
                </p>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
                gap: 16,
            }}>
                {rings.map((ring, idx) => {
                    const risk = getRiskColor(ring.risk_score);
                    const patternType = ring.pattern_type;

                    return (
                        <motion.div
                            key={ring.ring_id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3, delay: idx * 0.08 }}
                            className="glass-card"
                            style={{
                                padding: 20,
                                borderLeft: `3px solid ${risk.text}`,
                                boxShadow: ring.risk_score >= 70 ? risk.glow : 'var(--glass-shadow)',
                            }}
                        >
                            {/* Header */}
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                marginBottom: 14,
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <div style={{
                                        width: 36,
                                        height: 36,
                                        borderRadius: 'var(--radius-sm)',
                                        background: risk.bg,
                                        border: `1px solid ${risk.border}`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: risk.text,
                                    }}>
                                        {patternIcons[patternType] || <AlertTriangle size={16} />}
                                    </div>
                                    <div>
                                        <div style={{
                                            fontFamily: 'var(--font-mono)',
                                            fontWeight: 700,
                                            fontSize: '0.9rem',
                                            color: 'var(--text-primary)',
                                        }}>
                                            {ring.ring_id}
                                        </div>
                                        <div style={{
                                            fontSize: '0.75rem',
                                            color: 'var(--text-muted)',
                                        }}>
                                            {patternLabels[patternType] || patternType}
                                        </div>
                                    </div>
                                </div>

                                {/* Risk score badge */}
                                <div style={{
                                    padding: '6px 14px',
                                    borderRadius: 'var(--radius-full)',
                                    background: risk.bg,
                                    border: `1px solid ${risk.border}`,
                                    fontWeight: 700,
                                    fontSize: '0.85rem',
                                    fontFamily: 'var(--font-mono)',
                                    color: risk.text,
                                }}>
                                    {ring.risk_score}
                                </div>
                            </div>

                            {/* Stats row */}
                            <div style={{
                                display: 'flex',
                                gap: 24,
                                marginBottom: 14,
                                fontSize: '0.8rem',
                            }}>
                                <div>
                                    <div style={{ color: 'var(--text-muted)', marginBottom: 2 }}>Members</div>
                                    <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>
                                        {ring.member_accounts.length}
                                    </div>
                                </div>
                                <div>
                                    <div style={{ color: 'var(--text-muted)', marginBottom: 2 }}>Risk Level</div>
                                    <div style={{ fontWeight: 700, fontSize: '1.1rem', color: risk.text }}>
                                        {ring.risk_score >= 70 ? 'Critical' : ring.risk_score >= 40 ? 'High' : 'Medium'}
                                    </div>
                                </div>
                            </div>

                            {/* Risk bar */}
                            <div className="score-bar" style={{ marginBottom: 14 }}>
                                <div
                                    className={`score-bar-fill ${ring.risk_score >= 70 ? 'score-critical' : ring.risk_score >= 40 ? 'score-high' : 'score-medium'}`}
                                    style={{ width: `${ring.risk_score}%` }}
                                />
                            </div>

                            {/* Members */}
                            <div>
                                <div style={{
                                    fontSize: '0.7rem',
                                    color: 'var(--text-muted)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.06em',
                                    fontWeight: 600,
                                    marginBottom: 8,
                                }}>
                                    Member Accounts
                                </div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                    {ring.member_accounts.map(accId => (
                                        <span
                                            key={accId}
                                            style={{
                                                padding: '3px 8px',
                                                borderRadius: 'var(--radius-sm)',
                                                background: 'rgba(100, 116, 139, 0.1)',
                                                border: '1px solid rgba(100, 116, 139, 0.15)',
                                                fontFamily: 'var(--font-mono)',
                                                fontSize: '0.7rem',
                                                color: 'var(--text-secondary)',
                                            }}
                                        >
                                            {accId}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </motion.div>
    );
};

export default FraudRingTable;
