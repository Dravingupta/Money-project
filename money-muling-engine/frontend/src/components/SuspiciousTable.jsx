import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp, Search } from 'lucide-react';

const getBadgeClass = (pattern) => {
    const key = pattern.toLowerCase().replace(/\s+/g, '_');
    const knownBadges = [
        'cycle', 'smurfing', 'smurfing_fan_in', 'smurfing_fan_out',
        'shell_network', 'high_velocity', 'short_active_period'
    ];
    return knownBadges.includes(key) ? `badge badge-${key}` : 'badge badge-default';
};

const getScoreColor = (score) => {
    if (score >= 70) return '#fca5a5';
    if (score >= 40) return '#fdba74';
    if (score >= 20) return '#fcd34d';
    return '#6ee7b7';
};

const SuspiciousTable = ({ accounts }) => {
    const [sortField, setSortField] = useState('suspicion_score');
    const [sortDir, setSortDir] = useState('desc');
    const [search, setSearch] = useState('');

    if (!accounts || accounts.length === 0) return null;

    const handleSort = (field) => {
        if (sortField === field) {
            setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDir('desc');
        }
    };

    const filtered = accounts.filter(acc =>
        acc.account_id.toLowerCase().includes(search.toLowerCase()) ||
        acc.detected_patterns.some(p => p.toLowerCase().includes(search.toLowerCase())) ||
        (acc.ring_id || '').toLowerCase().includes(search.toLowerCase())
    );

    const sorted = [...filtered].sort((a, b) => {
        const valA = a[sortField];
        const valB = b[sortField];
        if (typeof valA === 'number') return sortDir === 'asc' ? valA - valB : valB - valA;
        return sortDir === 'asc'
            ? String(valA || '').localeCompare(String(valB || ''))
            : String(valB || '').localeCompare(String(valA || ''));
    });

    const SortIcon = ({ field }) => {
        if (sortField !== field) return null;
        return sortDir === 'asc'
            ? <ChevronUp size={14} style={{ opacity: 0.6 }} />
            : <ChevronDown size={14} style={{ opacity: 0.6 }} />;
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            style={{ marginBottom: 'var(--section-gap)' }}
        >
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 16,
                flexWrap: 'wrap',
                gap: 12,
            }}>
                <div>
                    <h2 style={{ fontSize: '1.25rem', color: 'var(--text-primary)' }}>
                        Suspicious Accounts
                    </h2>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>
                        {accounts.length} account{accounts.length !== 1 ? 's' : ''} flagged • Sorted by risk score
                    </p>
                </div>

                {/* Search */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '8px 14px',
                    borderRadius: 'var(--radius-full)',
                    border: '1px solid var(--glass-border)',
                    background: 'var(--bg-glass)',
                    minWidth: 220,
                }}>
                    <Search size={15} style={{ color: 'var(--text-muted)' }} />
                    <input
                        type="text"
                        placeholder="Search accounts..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            outline: 'none',
                            color: 'var(--text-primary)',
                            fontSize: '0.85rem',
                            fontFamily: 'var(--font-primary)',
                            width: '100%',
                        }}
                    />
                </div>
            </div>

            <div className="glass-card" style={{ overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table className="data-table">
                        <thead>
                            <tr>
                                {[
                                    { key: 'account_id', label: 'Account ID' },
                                    { key: 'suspicion_score', label: 'Score' },
                                    { key: null, label: 'Detected Patterns' },
                                    { key: 'ring_id', label: 'Ring ID' },
                                ].map(({ key, label }) => (
                                    <th
                                        key={label}
                                        onClick={() => key && handleSort(key)}
                                        style={{ cursor: key ? 'pointer' : 'default', userSelect: 'none' }}
                                    >
                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                            {label}
                                            {key && <SortIcon field={key} />}
                                        </span>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {sorted.map((acc, idx) => (
                                <motion.tr
                                    key={acc.account_id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: idx * 0.02 }}
                                >
                                    <td>
                                        <span style={{
                                            fontFamily: 'var(--font-mono)',
                                            fontWeight: 600,
                                            fontSize: '0.85rem',
                                        }}>
                                            {acc.account_id}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <span style={{
                                                fontFamily: 'var(--font-mono)',
                                                fontWeight: 700,
                                                fontSize: '0.9rem',
                                                color: getScoreColor(acc.suspicion_score),
                                                minWidth: 36,
                                            }}>
                                                {acc.suspicion_score}
                                            </span>
                                            <div style={{
                                                flex: 1,
                                                maxWidth: 80,
                                                height: 4,
                                                background: 'rgba(100, 116, 139, 0.15)',
                                                borderRadius: 'var(--radius-full)',
                                                overflow: 'hidden',
                                            }}>
                                                <div style={{
                                                    height: '100%',
                                                    width: `${acc.suspicion_score}%`,
                                                    borderRadius: 'var(--radius-full)',
                                                    background: acc.suspicion_score >= 70
                                                        ? 'var(--gradient-danger)'
                                                        : acc.suspicion_score >= 40
                                                            ? 'linear-gradient(90deg, #f97316, #ef4444)'
                                                            : 'linear-gradient(90deg, #f59e0b, #f97316)',
                                                    transition: 'width 0.5s ease',
                                                }} />
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                                            {acc.detected_patterns.map(p => (
                                                <span key={p} className={getBadgeClass(p)}>
                                                    {p.replace(/_/g, ' ')}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td>
                                        <span style={{
                                            fontFamily: 'var(--font-mono)',
                                            fontSize: '0.8rem',
                                            color: acc.ring_id ? 'var(--accent-cyan)' : 'var(--text-muted)',
                                        }}>
                                            {acc.ring_id || '—'}
                                        </span>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>

                    {sorted.length === 0 && search && (
                        <div style={{
                            textAlign: 'center',
                            padding: 32,
                            color: 'var(--text-muted)',
                            fontSize: '0.875rem',
                        }}>
                            No accounts match "{search}"
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default SuspiciousTable;
