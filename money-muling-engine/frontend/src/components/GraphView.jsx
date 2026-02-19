import React, { useEffect, useRef } from 'react';
import cytoscape from 'cytoscape';

const GraphView = ({ data }) => {
    const containerRef = useRef(null);

    useEffect(() => {
        if (!data || !containerRef.current) return;

        const { suspicious_accounts, fraud_rings } = data;
        const elements = [];
        const addedNodes = new Set();

        // 1. Add Suspicious Accounts as Nodes
        suspicious_accounts.forEach(acc => {
            elements.push({
                data: {
                    id: acc.account_id,
                    label: acc.account_id,
                    score: acc.suspicion_score,
                    patterns: acc.detected_patterns.join(', '),
                    type: 'suspicious'
                }
            });
            addedNodes.add(acc.account_id);
        });

        // 2. Add Ring Members as Nodes (if not already added)
        fraud_rings.forEach(ring => {
            ring.member_accounts.forEach(memberId => {
                if (!addedNodes.has(memberId)) {
                    elements.push({
                        data: {
                            id: memberId,
                            label: memberId,
                            type: 'normal' // Part of a ring but maybe not individually flagged high score? Or just normal context.
                        }
                    });
                    addedNodes.add(memberId);
                }
            });

            // 3. Inference Edges for Rings
            // Since we don't have transactions, we connect ring members to visualize the group.
            // Cycle: A->B->C->A
            // Other: Connect sequentially for now to show relationship
            const members = ring.member_accounts;
            if (members.length > 1) {
                for (let i = 0; i < members.length; i++) {
                    const source = members[i];
                    const target = members[(i + 1) % members.length]; // Wrap around for cycle vis

                    elements.push({
                        data: {
                            id: `${ring.ring_id}_${source}_${target}`,
                            source: source,
                            target: target,
                            label: ring.pattern_type
                        }
                    });
                }
            }
        });

        const cy = cytoscape({
            container: containerRef.current,
            elements: elements,
            style: [
                {
                    selector: 'node',
                    style: {
                        'label': 'data(id)',
                        'text-valign': 'center',
                        'text-halign': 'center',
                        'background-color': '#007bff',
                        'color': '#fff',
                        'width': 30,
                        'height': 30,
                        'font-size': '10px'
                    }
                },
                {
                    selector: 'node[type="suspicious"]',
                    style: {
                        'background-color': '#dc3545', // Red
                        'width': 50,
                        'height': 50,
                        'border-width': 2,
                        'border-color': '#000'
                    }
                },
                {
                    selector: 'edge',
                    style: {
                        'width': 2,
                        'line-color': '#ccc',
                        'target-arrow-color': '#ccc',
                        'target-arrow-shape': 'triangle',
                        'curve-style': 'bezier'
                    }
                }
            ],
            layout: {
                name: 'cose',
                animate: false,
                padding: 50
            }
        });

        // Event listener for node clicks
        cy.on('tap', 'node', function (evt) {
            const node = evt.target;
            alert(`Account: ${node.id()}\nScore: ${node.data('score') || 'N/A'}\nPatterns: ${node.data('patterns') || 'N/A'}`);
        });

        return () => cy.destroy();
    }, [data]);

    return (
        <div style={{ width: '100%', height: '500px', border: '1px solid #ddd', marginTop: '20px' }}>
            <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
        </div>
    );
};

export default GraphView;
