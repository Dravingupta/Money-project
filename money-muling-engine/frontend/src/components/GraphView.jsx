import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import cytoscape from 'cytoscape';
import { Maximize2, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

const RING_COLORS = [
    '#e8627c', '#d4a853', '#a78bfa', '#22d3ee', '#f97316',
    '#10b981', '#60a5fa', '#f472b6', '#e879f9', '#34d399',
];

const formatDateTime = (isoStr) => {
    if (!isoStr) return null;
    try {
        const d = new Date(isoStr);
        return d.toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric'
        }) + ' · ' + d.toLocaleTimeString('en-US', {
            hour: '2-digit', minute: '2-digit', hour12: true
        });
    } catch { return null; }
};

const MAX_GRAPH_RINGS = 20;

const GraphView = ({ data }) => {
    const containerRef = useRef(null);
    const cyRef = useRef(null);
    const [tooltip, setTooltip] = useState(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const wrapperRef = useRef(null);

    const totalRings = data?.fraud_rings?.length || 0;
    const isTooLarge = totalRings > MAX_GRAPH_RINGS;

    useEffect(() => {
        if (!data || !containerRef.current || isTooLarge) return;

        const { suspicious_accounts, fraud_rings } = data;
        const elements = [];
        const addedNodes = new Set();
        const suspiciousSet = new Set(suspicious_accounts.map(a => a.account_id));
        const accountScores = {};
        suspicious_accounts.forEach(a => { accountScores[a.account_id] = a; });

        // Assign colors to rings
        const ringColors = {};
        fraud_rings.forEach((ring, i) => {
            ringColors[ring.ring_id] = RING_COLORS[i % RING_COLORS.length];
        });

        // Map account to ring_id
        const accountRing = {};
        fraud_rings.forEach(ring => {
            ring.member_accounts.forEach(m => {
                if (!accountRing[m]) accountRing[m] = ring.ring_id;
            });
        });

        // Add suspicious account nodes
        suspicious_accounts.forEach(acc => {
            const ringId = accountRing[acc.account_id];
            const color = ringId ? ringColors[ringId] : '#e8627c';
            elements.push({
                data: {
                    id: acc.account_id,
                    label: acc.account_id.replace('ACC_', ''),
                    score: acc.suspicion_score,
                    patterns: acc.detected_patterns.join(', '),
                    ringId: acc.ring_id,
                    nodeColor: color,
                    type: 'suspicious',
                    isSuspicious: true,
                    firstSeen: acc.first_seen,
                    lastSeen: acc.last_seen,
                }
            });
            addedNodes.add(acc.account_id);
        });

        // Add ring member nodes
        fraud_rings.forEach(ring => {
            ring.member_accounts.forEach(memberId => {
                if (!addedNodes.has(memberId)) {
                    elements.push({
                        data: {
                            id: memberId,
                            label: memberId.replace('ACC_', ''),
                            type: 'ring_member',
                            nodeColor: ringColors[ring.ring_id],
                            ringId: ring.ring_id,
                            isSuspicious: false,
                        }
                    });
                    addedNodes.add(memberId);
                }
            });

            // Create edges
            const members = ring.member_accounts;
            if (members.length > 1) {
                for (let i = 0; i < members.length; i++) {
                    const source = members[i];
                    const target = members[(i + 1) % members.length];
                    elements.push({
                        data: {
                            id: `${ring.ring_id}_${source}_${target}`,
                            source,
                            target,
                            edgeColor: ringColors[ring.ring_id],
                            ringType: ring.pattern_type,
                        }
                    });
                }
            }
        });

        const cy = cytoscape({
            container: containerRef.current,
            elements,
            style: [
                {
                    selector: 'node',
                    style: {
                        'label': 'data(label)',
                        'text-valign': 'center',
                        'text-halign': 'center',
                        'background-color': 'data(nodeColor)',
                        'color': '#fff',
                        'width': 40,
                        'height': 40,
                        'font-size': '9px',
                        'font-family': "'JetBrains Mono', monospace",
                        'font-weight': '600',
                        'text-outline-width': 2,
                        'text-outline-color': '#09090b',
                        'border-width': 2,
                        'border-color': 'rgba(255,255,255,0.06)',
                        'overlay-opacity': 0,
                        'transition-property': 'width, height, border-width, border-color',
                        'transition-duration': '0.2s',
                    }
                },
                {
                    selector: 'node[?isSuspicious]',
                    style: {
                        'width': 55,
                        'height': 55,
                        'border-width': 3,
                        'border-color': 'data(nodeColor)',
                        'font-size': '10px',
                    }
                },
                {
                    selector: 'node:active',
                    style: { 'overlay-opacity': 0 }
                },
                {
                    selector: 'edge',
                    style: {
                        'width': 2,
                        'line-color': 'data(edgeColor)',
                        'target-arrow-color': 'data(edgeColor)',
                        'target-arrow-shape': 'triangle',
                        'curve-style': 'bezier',
                        'opacity': 0.5,
                        'arrow-scale': 1.2,
                    }
                },
                {
                    selector: 'node.hover',
                    style: {
                        'width': 70,
                        'height': 70,
                        'border-width': 4,
                        'font-size': '12px',
                        'z-index': 10,
                    }
                },
                {
                    selector: 'edge.highlighted',
                    style: { 'width': 4, 'opacity': 1 }
                },
                {
                    selector: 'node.dimmed',
                    style: { 'opacity': 0.12 }
                },
                {
                    selector: 'edge.dimmed',
                    style: { 'opacity': 0.06 }
                },
            ],
            layout: {
                name: 'cose',
                animate: true,
                animationDuration: 800,
                padding: 60,
                nodeRepulsion: () => 8000,
                idealEdgeLength: () => 100,
                gravity: 0.3,
            },
            minZoom: 0.3,
            maxZoom: 3,
        });

        // Hover effects
        cy.on('mouseover', 'node', (evt) => {
            const node = evt.target;
            node.addClass('hover');

            const connected = node.neighborhood();
            cy.elements().not(connected).not(node).addClass('dimmed');
            connected.edges().addClass('highlighted');

            const acc = accountScores[node.id()];
            const pos = evt.renderedPosition;
            setTooltip({
                x: pos.x,
                y: pos.y,
                id: node.id(),
                score: acc?.suspicion_score ?? 'N/A',
                patterns: acc?.detected_patterns?.join(', ') ?? 'Ring member',
                ring: acc?.ring_id ?? node.data('ringId') ?? 'N/A',
                firstSeen: acc?.first_seen || node.data('firstSeen'),
                lastSeen: acc?.last_seen || node.data('lastSeen'),
            });
        });

        cy.on('mouseout', 'node', () => {
            cy.elements().removeClass('hover dimmed highlighted');
            setTooltip(null);
        });

        cyRef.current = cy;
        return () => cy.destroy();
    }, [data]);

    const handleZoomIn = () => cyRef.current?.zoom(cyRef.current.zoom() * 1.3);
    const handleZoomOut = () => cyRef.current?.zoom(cyRef.current.zoom() * 0.7);
    const handleFit = () => cyRef.current?.fit(undefined, 50);
    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            wrapperRef.current?.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            style={{ marginBottom: 'var(--section-gap)' }}
        >
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 16,
            }}>
                <div>
                    <h2 style={{ fontSize: '1.25rem', color: 'var(--text-primary)' }}>
                        Network Graph
                    </h2>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>
                        Interactive visualization — Hover nodes to see account details & timestamps
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                    {[
                        { icon: ZoomIn, fn: handleZoomIn, label: 'Zoom In' },
                        { icon: ZoomOut, fn: handleZoomOut, label: 'Zoom Out' },
                        { icon: RotateCcw, fn: handleFit, label: 'Fit' },
                        { icon: Maximize2, fn: toggleFullscreen, label: 'Fullscreen' },
                    ].map(({ icon: Icon, fn, label }) => (
                        <button
                            key={label}
                            onClick={(e) => { e.stopPropagation(); fn(); }}
                            title={label}
                            style={{
                                width: 36,
                                height: 36,
                                borderRadius: 'var(--radius-sm)',
                                border: '1px solid var(--glass-border)',
                                background: 'var(--bg-glass)',
                                color: 'var(--text-muted)',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all var(--transition-fast)',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent-gold)'; e.currentTarget.style.color = 'var(--accent-gold)'; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--glass-border)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                        >
                            <Icon size={16} />
                        </button>
                    ))}
                </div>
            </div>

            {isTooLarge ? (
                <div
                    className="glass-card"
                    style={{
                        height: '280px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 12,
                        textAlign: 'center',
                        padding: 32,
                        background: 'radial-gradient(ellipse at center, rgba(19, 19, 22, 0.95), rgba(9, 9, 11, 1))',
                    }}
                >
                    <div style={{
                        width: 56, height: 56,
                        borderRadius: 'var(--radius-md)',
                        background: 'rgba(212, 168, 83, 0.08)',
                        border: '1px solid rgba(212, 168, 83, 0.12)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1.5rem',
                    }}>
                        📊
                    </div>
                    <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        Dataset Too Large for Graph Rendering
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: 420 }}>
                        This dataset has <span style={{ color: 'var(--accent-gold)', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{totalRings}</span> detected rings — graph visualization is capped at {MAX_GRAPH_RINGS} rings to maintain performance. View the <strong>Suspicious Accounts</strong> and <strong>Fraud Rings</strong> tabs for full results.
                    </div>
                </div>
            ) : (
                <div
                    ref={wrapperRef}
                    className="glass-card"
                    style={{
                        position: 'relative',
                        height: isFullscreen ? '100vh' : '520px',
                        overflow: 'hidden',
                        background: 'radial-gradient(ellipse at center, rgba(19, 19, 22, 0.95), rgba(9, 9, 11, 1))',
                    }}
                >
                    <div ref={containerRef} style={{ width: '100%', height: '100%' }} />

                    {/* Tooltip */}
                    {tooltip && (
                        <div style={{
                            position: 'absolute',
                            left: Math.min(tooltip.x + 15, (wrapperRef.current?.clientWidth || 800) - 250),
                            top: Math.max(tooltip.y - 10, 10),
                            background: 'rgba(9, 9, 11, 0.96)',
                            backdropFilter: 'blur(16px)',
                            border: '1px solid rgba(212, 168, 83, 0.15)',
                            borderRadius: 'var(--radius-md)',
                            padding: '14px 18px',
                            minWidth: 230,
                            zIndex: 50,
                            boxShadow: '0 12px 40px rgba(0,0,0,0.5), 0 0 20px rgba(212, 168, 83, 0.05)',
                            pointerEvents: 'none',
                        }}>
                            <div style={{
                                fontFamily: 'var(--font-mono)',
                                fontWeight: 700,
                                fontSize: '0.9rem',
                                color: 'var(--accent-gold)',
                                marginBottom: 10,
                                letterSpacing: '0.02em',
                            }}>
                                {tooltip.id}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.78rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
                                    <span style={{ color: 'var(--text-muted)' }}>Score</span>
                                    <span style={{
                                        fontWeight: 700,
                                        fontFamily: 'var(--font-mono)',
                                        color: tooltip.score > 70 ? '#fca5a5'
                                            : tooltip.score > 40 ? '#fdba74'
                                                : '#6ee7b7'
                                    }}>
                                        {tooltip.score}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
                                    <span style={{ color: 'var(--text-muted)' }}>Ring</span>
                                    <span style={{ fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{tooltip.ring}</span>
                                </div>

                                {/* Timestamps section */}
                                {(tooltip.firstSeen || tooltip.lastSeen) && (
                                    <>
                                        <div style={{
                                            borderTop: '1px solid rgba(212, 168, 83, 0.1)',
                                            margin: '4px 0',
                                        }} />
                                        {tooltip.firstSeen && (
                                            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
                                                <span style={{ color: 'var(--text-muted)' }}>First Seen</span>
                                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.72rem' }}>
                                                    {formatDateTime(tooltip.firstSeen)}
                                                </span>
                                            </div>
                                        )}
                                        {tooltip.lastSeen && (
                                            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
                                                <span style={{ color: 'var(--text-muted)' }}>Last Seen</span>
                                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.72rem' }}>
                                                    {formatDateTime(tooltip.lastSeen)}
                                                </span>
                                            </div>
                                        )}
                                    </>
                                )}

                                <div style={{
                                    borderTop: '1px solid rgba(212, 168, 83, 0.1)',
                                    margin: '4px 0',
                                }} />
                                <div>
                                    <span style={{ color: 'var(--text-muted)' }}>Patterns: </span>
                                    <span style={{ color: 'var(--text-secondary)' }}>{tooltip.patterns}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Legend */}
                    {data && (
                        <div style={{
                            position: 'absolute',
                            bottom: 16,
                            left: 16,
                            background: 'rgba(9, 9, 11, 0.88)',
                            backdropFilter: 'blur(8px)',
                            border: '1px solid rgba(212, 168, 83, 0.1)',
                            borderRadius: 'var(--radius-md)',
                            padding: '10px 14px',
                            fontSize: '0.7rem',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 6,
                        }}>
                            {data.fraud_rings.map((ring, i) => (
                                <div key={ring.ring_id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <div style={{
                                        width: 10,
                                        height: 10,
                                        borderRadius: '50%',
                                        background: RING_COLORS[i % RING_COLORS.length],
                                        boxShadow: `0 0 6px ${RING_COLORS[i % RING_COLORS.length]}30`,
                                    }} />
                                    <span style={{ color: 'var(--text-secondary)' }}>
                                        {ring.ring_id} — {ring.pattern_type}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </motion.div>
    );
};

export default GraphView;
