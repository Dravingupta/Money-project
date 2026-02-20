import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, AlertCircle, CheckCircle2, Loader2, Network, Shield, BarChart3 } from 'lucide-react';
import apiClient from '../api/apiClient';

/* ─── Animated analysis loader steps ─── */
const LOADER_STEPS = [
    { icon: Upload, text: 'Uploading transaction data...', delay: 0 },
    { icon: Network, text: 'Building transaction graph...', delay: 4000 },
    { icon: Shield, text: 'Detecting cycle patterns...', delay: 9000 },
    { icon: Shield, text: 'Scanning for smurfing rings...', delay: 15000 },
    { icon: Shield, text: 'Analyzing shell networks...', delay: 22000 },
    { icon: BarChart3, text: 'Calculating suspicion scores...', delay: 30000 },
    { icon: BarChart3, text: 'Generating risk report...', delay: 40000 },
    { icon: CheckCircle2, text: 'Finalizing results...', delay: 55000 },
];

const AnalysisLoader = ({ progress }) => {
    const [activeStep, setActiveStep] = useState(0);
    const [elapsed, setElapsed] = useState(0);

    useEffect(() => {
        const start = Date.now();
        const timer = setInterval(() => {
            const ms = Date.now() - start;
            setElapsed(ms);
            // Find the latest step whose delay has been reached
            let latest = 0;
            for (let i = LOADER_STEPS.length - 1; i >= 0; i--) {
                if (ms >= LOADER_STEPS[i].delay) { latest = i; break; }
            }
            setActiveStep(latest);
        }, 500);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (ms) => {
        const s = Math.floor(ms / 1000);
        return s < 60 ? `${s}s` : `${Math.floor(s / 60)}m ${s % 60}s`;
    };

    const ActiveIcon = LOADER_STEPS[activeStep].icon;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            style={{
                padding: '48px 32px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 28,
            }}
        >
            {/* Animated ring spinner */}
            <div style={{ position: 'relative', width: 80, height: 80 }}>
                <svg width="80" height="80" viewBox="0 0 80 80" style={{ position: 'absolute', top: 0, left: 0 }}>
                    <circle cx="40" cy="40" r="35" fill="none" stroke="rgba(212, 168, 83, 0.08)" strokeWidth="3" />
                    <motion.circle
                        cx="40" cy="40" r="35" fill="none"
                        stroke="url(#gold-gradient)" strokeWidth="3"
                        strokeLinecap="round"
                        strokeDasharray="220"
                        animate={{ strokeDashoffset: [220, 0, 220] }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    />
                    <defs>
                        <linearGradient id="gold-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#d4a853" />
                            <stop offset="100%" stopColor="#e8627c" />
                        </linearGradient>
                    </defs>
                </svg>
                <div
                    style={{
                        position: 'absolute',
                        top: 0, left: 0, width: '100%', height: '100%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                >
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeStep}
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.5 }}
                            transition={{ duration: 0.2 }}
                            style={{ color: 'var(--accent-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                            <ActiveIcon size={28} />
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* Status text */}
            <div style={{ textAlign: 'center' }}>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeStep}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.3 }}
                        style={{
                            fontSize: '1rem',
                            fontWeight: 600,
                            color: 'var(--text-primary)',
                            marginBottom: 6,
                        }}
                    >
                        {LOADER_STEPS[activeStep].text}
                    </motion.div>
                </AnimatePresence>
                <div style={{
                    fontSize: '0.78rem',
                    color: 'var(--text-muted)',
                    fontFamily: 'var(--font-mono)',
                }}>
                    Elapsed: {formatTime(elapsed)}
                </div>
            </div>

            {/* Progress bar */}
            <div style={{
                width: '100%',
                maxWidth: 320,
            }}>
                <div style={{
                    height: 4,
                    borderRadius: 'var(--radius-full)',
                    background: 'rgba(120, 113, 108, 0.12)',
                    overflow: 'hidden',
                }}>
                    <motion.div
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.4 }}
                        style={{
                            height: '100%',
                            borderRadius: 'var(--radius-full)',
                            background: 'var(--gradient-accent)',
                        }}
                    />
                </div>
            </div>

            {/* Step indicators */}
            <div style={{
                display: 'flex',
                gap: 5,
                alignItems: 'center',
            }}>
                {LOADER_STEPS.map((_, i) => (
                    <div
                        key={i}
                        style={{
                            width: i <= activeStep ? 16 : 6,
                            height: 6,
                            borderRadius: 'var(--radius-full)',
                            background: i <= activeStep
                                ? 'var(--accent-gold)'
                                : 'rgba(120, 113, 108, 0.15)',
                            transition: 'all 0.4s ease',
                            opacity: i <= activeStep ? 1 : 0.5,
                        }}
                    />
                ))}
            </div>

            {elapsed > 10000 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{
                        fontSize: '0.75rem',
                        color: 'var(--text-muted)',
                        textAlign: 'center',
                        maxWidth: 360,
                        lineHeight: 1.5,
                    }}
                >
                    {elapsed > 30000
                        ? 'The server is warming up from a cold start — this can take up to 60 seconds on the first request.'
                        : 'Analyzing your transaction graph for fraud patterns...'}
                </motion.div>
            )}
        </motion.div>
    );
};

/* ─── Main Upload Form ─── */
const UploadForm = ({ onUploadSuccess }) => {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [progress, setProgress] = useState(0);

    const handleFile = (f) => {
        if (f && f.name.endsWith('.csv')) {
            setFile(f);
            setError(null);
            setMessage(null);
        } else {
            setError('Please upload a valid .csv file');
        }
    };

    const handleFileChange = (e) => handleFile(e.target.files[0]);

    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        const droppedFile = e.dataTransfer.files[0];
        handleFile(droppedFile);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            setError('Please select a CSV file.');
            return;
        }

        setLoading(true);
        setError(null);
        setMessage(null);
        setProgress(5);

        const formData = new FormData();
        formData.append('file', file);

        // Slower progress that works for both fast and cold-start responses
        const progressInterval = setInterval(() => {
            setProgress(prev => {
                if (prev < 30) return prev + Math.random() * 3;
                if (prev < 60) return prev + Math.random() * 1.5;
                if (prev < 80) return prev + Math.random() * 0.5;
                return Math.min(prev + Math.random() * 0.2, 88);
            });
        }, 500);

        try {
            const response = await apiClient.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                timeout: 120000, // 2 min timeout for cold starts
            });
            clearInterval(progressInterval);
            setProgress(100);
            setMessage('Analysis complete!');
            setTimeout(() => {
                setLoading(false);
                onUploadSuccess(response.data);
            }, 600);
        } catch (err) {
            clearInterval(progressInterval);
            setProgress(0);
            setLoading(false);
            console.error(err);
            const errorMessage = err.response?.data?.error || err.message || 'Upload failed.';
            const details = err.response?.data?.details;
            setError(details ? `${errorMessage}: ${details.join(', ')}` : errorMessage);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{ marginBottom: 'var(--section-gap)' }}
        >
            <AnimatePresence mode="wait">
                {loading ? (
                    <motion.div
                        key="loader"
                        className="glass-card"
                        style={{ overflow: 'hidden' }}
                    >
                        <AnalysisLoader progress={progress} />
                    </motion.div>
                ) : (
                    <motion.div
                        key="form"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <form onSubmit={handleSubmit}>
                            <div
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                onClick={() => document.getElementById('file-input').click()}
                                style={{
                                    position: 'relative',
                                    padding: file ? '32px' : '56px 32px',
                                    borderRadius: 'var(--radius-lg)',
                                    border: `2px dashed ${isDragging ? 'var(--accent-gold)' : file ? 'var(--accent-emerald)' : 'rgba(168, 162, 158, 0.15)'}`,
                                    background: isDragging
                                        ? 'rgba(212, 168, 83, 0.04)'
                                        : file
                                            ? 'rgba(16, 185, 129, 0.03)'
                                            : 'var(--bg-glass)',
                                    cursor: 'pointer',
                                    textAlign: 'center',
                                    transition: 'all var(--transition-base)',
                                    overflow: 'hidden',
                                }}
                            >
                                <input
                                    id="file-input"
                                    type="file"
                                    accept=".csv"
                                    onChange={handleFileChange}
                                    disabled={loading}
                                    style={{ display: 'none' }}
                                />

                                <AnimatePresence mode="wait">
                                    {!file ? (
                                        <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                            <div style={{
                                                width: 64, height: 64,
                                                borderRadius: 'var(--radius-lg)',
                                                background: 'rgba(212, 168, 83, 0.08)',
                                                border: '1px solid rgba(212, 168, 83, 0.12)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                margin: '0 auto 16px',
                                            }}>
                                                <Upload size={28} style={{ color: 'var(--accent-gold)' }} />
                                            </div>
                                            <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>
                                                Drop your transaction CSV here
                                            </div>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                                or click to browse • Supports files up to 10K transactions
                                            </div>
                                            <div style={{
                                                display: 'flex', justifyContent: 'center', gap: 20, marginTop: 16,
                                                fontSize: '0.75rem', color: 'var(--text-muted)',
                                            }}>
                                                <span>transaction_id</span><span style={{ color: 'rgba(212,168,83,0.3)' }}>•</span>
                                                <span>sender_id</span><span style={{ color: 'rgba(212,168,83,0.3)' }}>•</span>
                                                <span>receiver_id</span><span style={{ color: 'rgba(212,168,83,0.3)' }}>•</span>
                                                <span>amount</span><span style={{ color: 'rgba(212,168,83,0.3)' }}>•</span>
                                                <span>timestamp</span>
                                            </div>
                                        </motion.div>
                                    ) : (
                                        <motion.div key="file-selected" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
                                            <div style={{
                                                width: 44, height: 44,
                                                borderRadius: 'var(--radius-md)',
                                                background: 'rgba(16, 185, 129, 0.08)',
                                                border: '1px solid rgba(16, 185, 129, 0.15)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                            }}>
                                                <FileText size={22} style={{ color: 'var(--accent-emerald)' }} />
                                            </div>
                                            <div style={{ textAlign: 'left' }}>
                                                <div style={{ fontWeight: 600, fontSize: '0.95rem', fontFamily: 'var(--font-mono)' }}>
                                                    {file.name}
                                                </div>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                                    {(file.size / 1024).toFixed(1)} KB • Ready to analyze
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Submit Button */}
                            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 20, gap: 12 }}>
                                <button
                                    type="submit"
                                    disabled={!file}
                                    style={{
                                        display: 'inline-flex', alignItems: 'center', gap: 10,
                                        padding: '14px 36px',
                                        borderRadius: 'var(--radius-full)',
                                        border: 'none',
                                        background: !file ? 'rgba(120, 113, 108, 0.15)' : 'var(--gradient-accent)',
                                        color: !file ? 'var(--text-muted)' : '#09090b',
                                        fontSize: '0.95rem', fontWeight: 700,
                                        fontFamily: 'var(--font-primary)',
                                        cursor: !file ? 'not-allowed' : 'pointer',
                                        transition: 'all var(--transition-base)',
                                        boxShadow: !file ? 'none' : '0 4px 24px rgba(212, 168, 83, 0.25)',
                                        letterSpacing: '-0.01em',
                                    }}
                                >
                                    <Upload size={18} />
                                    Upload & Analyze
                                </button>
                            </div>
                        </form>

                        {/* Status Messages */}
                        <AnimatePresence>
                            {error && (
                                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: 10,
                                        marginTop: 16, padding: '12px 20px',
                                        borderRadius: 'var(--radius-md)',
                                        background: 'rgba(239, 68, 68, 0.06)',
                                        border: '1px solid rgba(239, 68, 68, 0.15)',
                                        color: '#fca5a5', fontSize: '0.875rem',
                                    }}
                                >
                                    <AlertCircle size={18} />{error}
                                </motion.div>
                            )}
                            {message && (
                                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: 10,
                                        marginTop: 16, padding: '12px 20px',
                                        borderRadius: 'var(--radius-md)',
                                        background: 'rgba(16, 185, 129, 0.06)',
                                        border: '1px solid rgba(16, 185, 129, 0.15)',
                                        color: '#6ee7b7', fontSize: '0.875rem',
                                    }}
                                >
                                    <CheckCircle2 size={18} />{message}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default UploadForm;
