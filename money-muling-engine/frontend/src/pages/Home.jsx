import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Activity, Users, AlertTriangle, Clock,
    ShieldAlert, BarChart3, Network
} from 'lucide-react';
import UploadForm from '../components/UploadForm';
import GraphView from '../components/GraphView';
import FraudRingTable from '../components/FraudRingTable';
import SuspiciousTable from '../components/SuspiciousTable';
import DownloadButton from '../components/DownloadButton';

const StatCard = ({ icon: Icon, label, value, color, delay = 0 }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay }}
        className="glass-card"
        style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16 }}
    >
        <div style={{
            width: 44, height: 44,
            borderRadius: 'var(--radius-md)',
            background: `${color}12`,
            border: `1px solid ${color}25`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color, flexShrink: 0,
        }}>
            <Icon size={22} />
        </div>
        <div>
            <div style={{
                fontSize: '0.75rem', color: 'var(--text-muted)',
                textTransform: 'uppercase', letterSpacing: '0.06em',
                fontWeight: 600, marginBottom: 2,
            }}>
                {label}
            </div>
            <div style={{
                fontSize: '1.6rem', fontWeight: 800,
                fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', lineHeight: 1,
            }}>
                {value}
            </div>
        </div>
    </motion.div>
);

const Home = () => {
    const [results, setResults] = useState(null);
    const [activeTab, setActiveTab] = useState('graph');

    const tabs = [
        { id: 'graph', label: 'Network Graph', icon: Network },
        { id: 'accounts', label: 'Suspicious Accounts', icon: ShieldAlert },
        { id: 'rings', label: 'Fraud Rings', icon: BarChart3 },
    ];

    return (
        <div>
            {/* Hero */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
                style={{ marginBottom: 'var(--section-gap)' }}
            >
                <div style={{ maxWidth: 640 }}>
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: 8,
                        padding: '6px 14px', borderRadius: 'var(--radius-full)',
                        background: 'rgba(212, 168, 83, 0.06)',
                        border: '1px solid rgba(212, 168, 83, 0.15)',
                        marginBottom: 16, fontSize: '0.75rem', fontWeight: 600,
                        color: 'var(--accent-gold)',
                        textTransform: 'uppercase', letterSpacing: '0.06em',
                    }}>
                        <Activity size={14} />
                        Financial Forensics Engine
                    </div>
                    <h1 style={{
                        fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
                        fontWeight: 800, lineHeight: 1.15,
                        color: 'var(--text-primary)', marginBottom: 12,
                    }}>
                        Detect Money Muling{' '}
                        <span className="shimmer-text">Networks</span>
                    </h1>
                    <p style={{
                        fontSize: '1rem', color: 'var(--text-secondary)',
                        lineHeight: 1.6, maxWidth: 520,
                    }}>
                        Upload your transaction CSV to expose circular fund routing, smurfing patterns, and layered shell networks through advanced graph analysis.
                    </p>
                </div>
            </motion.div>

            <UploadForm onUploadSuccess={setResults} />

            <AnimatePresence>
                {results && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
                        {/* Stats */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                            gap: 16, marginBottom: 'var(--section-gap)',
                        }}>
                            <StatCard icon={Users} label="Accounts Analyzed" value={results.summary.total_accounts_analyzed.toLocaleString()} color="#d4a853" delay={0} />
                            <StatCard icon={AlertTriangle} label="Suspicious Flagged" value={results.summary.suspicious_accounts_flagged} color="#e8627c" delay={0.1} />
                            <StatCard icon={ShieldAlert} label="Rings Detected" value={results.summary.fraud_rings_detected} color="#f97316" delay={0.2} />
                            <StatCard icon={Clock} label="Processing Time" value={`${results.summary.processing_time_seconds}s`} color="#10b981" delay={0.3} />
                        </div>

                        {/* Action Bar */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                marginBottom: 'var(--section-gap)', flexWrap: 'wrap', gap: 16,
                            }}
                        >
                            {/* Tabs */}
                            <div style={{
                                display: 'flex', gap: 4, padding: 4,
                                borderRadius: 'var(--radius-full)',
                                background: 'var(--bg-glass)',
                                border: '1px solid var(--glass-border)',
                            }}>
                                {tabs.map(tab => {
                                    const Icon = tab.icon;
                                    const isActive = activeTab === tab.id;
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: 8,
                                                padding: '8px 18px',
                                                borderRadius: 'var(--radius-full)',
                                                border: 'none',
                                                background: isActive ? 'var(--gradient-accent)' : 'transparent',
                                                color: isActive ? '#09090b' : 'var(--text-muted)',
                                                fontSize: '0.82rem', fontWeight: 600,
                                                fontFamily: 'var(--font-primary)',
                                                cursor: 'pointer',
                                                transition: 'all var(--transition-fast)',
                                                boxShadow: isActive ? '0 2px 16px rgba(212, 168, 83, 0.2)' : 'none',
                                            }}
                                        >
                                            <Icon size={15} />
                                            {tab.label}
                                        </button>
                                    );
                                })}
                            </div>

                            <DownloadButton data={results} />
                        </motion.div>

                        {/* Tab Content */}
                        <AnimatePresence mode="wait">
                            {activeTab === 'graph' && (
                                <motion.div key="graph" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                    <GraphView data={results} />
                                </motion.div>
                            )}
                            {activeTab === 'accounts' && (
                                <motion.div key="accounts" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                    <SuspiciousTable accounts={results.suspicious_accounts} />
                                </motion.div>
                            )}
                            {activeTab === 'rings' && (
                                <motion.div key="rings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                    <FraudRingTable rings={results.fraud_rings} />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Home;
