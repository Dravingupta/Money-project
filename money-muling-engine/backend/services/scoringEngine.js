/**
 * Calculates suspicion scores for all accounts.
 *
 * Scoring breakdown:
 *   - cycle base        = 40 pts
 *   - cycle high amount = +15 pts (avg cycle amount > $10K)
 *   - cycle amount decay= +10 pts (decreasing amounts through cycle)
 *   - cycle tight time  = +10 pts (all cycle txs within 24h)
 *   - smurfing base     = 25 pts
 *   - smurfing large    = +10 pts (15+ participants)
 *   - shell base        = 15 pts
 *   - high_velocity     = 10 pts
 *   - short_active      =  5 pts
 *   - mitigation        = -20 pts (long-term high-volume accounts)
 *
 * Threshold: 30.
 */
export const calculateSuspicionScores = ({
    accountStats,
    cycleResults,
    smurfResults,
    shellResults,
    transactionsByAccount
}) => {
    const suspiciousAccounts = [];
    const accounts = Object.keys(accountStats);

    const SCORES = {
        CYCLE: 40,
        CYCLE_HIGH_AMOUNT: 15,
        CYCLE_AMOUNT_DECAY: 10,
        CYCLE_TIGHT_TIME: 10,
        SMURFING: 25,
        SMURFING_LARGE: 10,
        SHELL: 15,
        HIGH_VELOCITY: 10,
        SHORT_ACTIVE: 5,
        MITIGATION: -20
    };

    const MIN_SUSPICION_THRESHOLD = 30;

    const cycleMembers = new Set(cycleResults.accountsInCycles);
    const smurfMembers = new Set(smurfResults.accountsInSmurfing);
    const shellMembers = new Set(shellResults.accountsInShellNetworks);

    // Pre-compute cycle ring metadata for nuanced scoring
    const cycleRingMeta = new Map(); // ring_id -> { avgAmount, hasDecay, tightTime }
    if (cycleResults.detectedRings) {
        for (const ring of cycleResults.detectedRings) {
            const ringTxs = [];
            // Collect all transactions between ring members
            for (const accId of ring.member_accounts) {
                const txs = transactionsByAccount[accId] || [];
                for (const tx of txs) {
                    if (ring.member_accounts.includes(tx.sender_id) &&
                        ring.member_accounts.includes(tx.receiver_id)) {
                        ringTxs.push(tx);
                    }
                }
            }

            // Deduplicate (each tx appears for both sender and receiver)
            const seen = new Set();
            const uniqueTxs = ringTxs.filter(tx => {
                const id = tx.transaction_id;
                if (seen.has(id)) return false;
                seen.add(id);
                return true;
            });

            // Average amount
            const amounts = uniqueTxs.map(tx => tx.amount);
            const avgAmount = amounts.length > 0 ? amounts.reduce((a, b) => a + b, 0) / amounts.length : 0;

            // Amount decay: check if amounts decrease along the cycle
            const sorted = [...uniqueTxs].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
            let hasDecay = false;
            if (sorted.length >= 3) {
                const sortedAmounts = sorted.map(tx => tx.amount);
                hasDecay = sortedAmounts.every((val, i) => i === 0 || val <= sortedAmounts[i - 1]);
            }

            // Tight time: all transactions within 24 hours
            let tightTime = false;
            if (sorted.length >= 2) {
                const first = new Date(sorted[0].timestamp).getTime();
                const last = new Date(sorted[sorted.length - 1].timestamp).getTime();
                tightTime = (last - first) <= 24 * 60 * 60 * 1000;
            }

            cycleRingMeta.set(ring.ring_id, { avgAmount, hasDecay, tightTime });
        }
    }

    // Pre-compute smurfing ring sizes
    const smurfRingSizes = new Map();
    if (smurfResults.detectedRings) {
        for (const ring of smurfResults.detectedRings) {
            smurfRingSizes.set(ring.ring_id, ring.member_accounts.length);
        }
    }

    const checkHighVelocity = (txs) => {
        if (!txs || txs.length < 5) return false;
        const sortedTxs = [...txs].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        const WINDOW_MS = 24 * 60 * 60 * 1000;
        let left = 0;
        for (let right = 0; right < sortedTxs.length; right++) {
            while (new Date(sortedTxs[right].timestamp) - new Date(sortedTxs[left].timestamp) > WINDOW_MS) {
                left++;
            }
            if (right - left + 1 >= 5) return true;
        }
        return false;
    };

    for (const accId of accounts) {
        let score = 0;
        const stats = accountStats[accId];
        const patterns = [];
        const relatedRings = [];

        const firstTx = new Date(stats.firstTransaction);
        const lastTx = new Date(stats.lastTransaction);
        const lifeSpanMs = lastTx - firstTx;
        const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;

        // 1. Cycle — strong signal with nuanced bonuses
        if (cycleMembers.has(accId)) {
            score += SCORES.CYCLE;
            patterns.push('cycle');

            cycleResults.detectedRings.forEach(ring => {
                if (ring.member_accounts.includes(accId)) {
                    relatedRings.push(ring.ring_id);

                    const meta = cycleRingMeta.get(ring.ring_id);
                    if (meta) {
                        if (meta.avgAmount > 10000) score += SCORES.CYCLE_HIGH_AMOUNT;
                        if (meta.hasDecay) score += SCORES.CYCLE_AMOUNT_DECAY;
                        if (meta.tightTime) score += SCORES.CYCLE_TIGHT_TIME;
                    }
                }
            });
        }

        // 2. Smurfing — medium signal with size bonus
        if (smurfMembers.has(accId)) {
            score += SCORES.SMURFING;
            patterns.push('smurfing');

            smurfResults.detectedRings.forEach(ring => {
                if (ring.member_accounts.includes(accId)) {
                    if (!patterns.includes(ring.pattern_type)) patterns.push(ring.pattern_type);
                    relatedRings.push(ring.ring_id);

                    const size = smurfRingSizes.get(ring.ring_id) || 0;
                    if (size >= 15) score += SCORES.SMURFING_LARGE;
                }
            });
        }

        // Clean up 'smurfing' label if specific type is present
        if (patterns.includes('smurfing') && (patterns.includes('smurfing_fan_in') || patterns.includes('smurfing_fan_out'))) {
            const idx = patterns.indexOf('smurfing');
            patterns.splice(idx, 1);
        }

        // 3. Shell — meaningful signal (now requires 3+ hop chains)
        if (shellMembers.has(accId)) {
            score += SCORES.SHELL;
            patterns.push('shell_network');
            shellResults.detectedRings.forEach(ring => {
                if (ring.member_accounts.includes(accId)) relatedRings.push(ring.ring_id);
            });
        }

        // 4. High Velocity — behavioral
        const txs = transactionsByAccount[accId] || [];
        if (checkHighVelocity(txs)) {
            score += SCORES.HIGH_VELOCITY;
            patterns.push('high_velocity');
        }

        // 5. Short Active Period (< 3 days)
        const threeDaysMs = 3 * 24 * 60 * 60 * 1000;
        if (lifeSpanMs < threeDaysMs) {
            score += SCORES.SHORT_ACTIVE;
            patterns.push('short_active_period');
        }

        // 6. Mitigation — long-term high-volume accounts
        if (lifeSpanMs > thirtyDaysMs && stats.totalTransactions > 50) {
            score += SCORES.MITIGATION;
        }

        // 7. Normalize to 0-100
        score = Math.max(0, Math.min(100, score));

        // 8. Threshold gate
        if (score >= MIN_SUSPICION_THRESHOLD && patterns.length > 0) {
            suspiciousAccounts.push({
                account_id: accId,
                suspicion_score: score,
                detected_patterns: [...new Set(patterns)],
                ring_ids: [...new Set(relatedRings)]
            });
        }
    }

    suspiciousAccounts.sort((a, b) => b.suspicion_score - a.suspicion_score);
    return { suspiciousAccounts };
};
