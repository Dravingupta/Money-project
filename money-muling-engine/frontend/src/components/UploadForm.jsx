import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import apiClient from '../api/apiClient';

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
        setProgress(10);

        const formData = new FormData();
        formData.append('file', file);

        const progressInterval = setInterval(() => {
            setProgress(prev => Math.min(prev + Math.random() * 15, 85));
        }, 300);

        try {
            const response = await apiClient.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            clearInterval(progressInterval);
            setProgress(100);
            setMessage('Analysis complete!');
            setTimeout(() => onUploadSuccess(response.data), 400);
        } catch (err) {
            clearInterval(progressInterval);
            setProgress(0);
            console.error(err);
            const errorMessage = err.response?.data?.error || err.message || 'Upload failed.';
            const details = err.response?.data?.details;
            setError(details ? `${errorMessage}: ${details.join(', ')}` : errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{ marginBottom: 'var(--section-gap)' }}
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

                    {/* Progress bar */}
                    {loading && (
                        <div style={{
                            position: 'absolute',
                            top: 0, left: 0, right: 0,
                            height: '3px',
                            background: 'rgba(120, 113, 108, 0.15)',
                        }}>
                            <motion.div
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.3 }}
                                style={{
                                    height: '100%',
                                    background: 'var(--gradient-accent)',
                                    borderRadius: 'var(--radius-full)',
                                }}
                            />
                        </div>
                    )}

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

                {/* Submit Button — Gold gradient */}
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: 20, gap: 12 }}>
                    <button
                        type="submit"
                        disabled={!file || loading}
                        style={{
                            display: 'inline-flex', alignItems: 'center', gap: 10,
                            padding: '14px 36px',
                            borderRadius: 'var(--radius-full)',
                            border: 'none',
                            background: (!file || loading) ? 'rgba(120, 113, 108, 0.15)' : 'var(--gradient-accent)',
                            color: (!file || loading) ? 'var(--text-muted)' : '#09090b',
                            fontSize: '0.95rem', fontWeight: 700,
                            fontFamily: 'var(--font-primary)',
                            cursor: (!file || loading) ? 'not-allowed' : 'pointer',
                            transition: 'all var(--transition-base)',
                            boxShadow: (!file || loading) ? 'none' : '0 4px 24px rgba(212, 168, 83, 0.25)',
                            letterSpacing: '-0.01em',
                        }}
                    >
                        {loading ? (
                            <>
                                <Loader2 size={18} style={{ animation: 'spin-slow 0.8s linear infinite' }} />
                                Analyzing Graph...
                            </>
                        ) : (
                            <>
                                <Upload size={18} />
                                Upload & Analyze
                            </>
                        )}
                    </button>
                </div>
            </form>

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
    );
};

export default UploadForm;
