/**
 * Generates the final JSON output matching the hackathon specification.
 * 
 * Ensures consistency: every account that appears in a fraud_ring also
 * appears in suspicious_accounts (with at least a floor score).
 *
 * @param {Object} data - Processed data from all modules.
 * @returns {Object} - Formatted JSON.
 */
export const generateFinalOutput = ({
    suspiciousAccounts,
    cycleResults,
    smurfResults,
    shellResults,
    totalAccounts,
    processingTimeSeconds,
    accountStats = {}
}) => {
    // 1. Index suspicious accounts by ID for easy lookup
    const accountMap = new Map();
    suspiciousAccounts.forEach(acc => {
        accountMap.set(acc.account_id, { ...acc });
    });

    // 2. Collect and Format Fraud Rings
    const formattedRings = [];

    const processRings = (rings, type) => {
        rings.forEach(ring => {
            // Calculate risk score: Average of member suspicion scores
            let totalScore = 0;
            let memberCount = 0;

            ring.member_accounts.forEach(memberId => {
                const acc = accountMap.get(memberId);
                if (acc) {
                    totalScore += acc.suspicion_score;
                    memberCount++;
                }
            });

            const avgScore = memberCount > 0 ? totalScore / memberCount : 0;

            formattedRings.push({
                ring_id: ring.ring_id,
                member_accounts: [...ring.member_accounts].sort(),
                pattern_type: ring.pattern_type || type,
                risk_score: parseFloat(avgScore.toFixed(1))
            });
        });
    };

    processRings(cycleResults.detectedRings, 'cycle');
    processRings(smurfResults.detectedRings, 'smurfing');
    processRings(shellResults.detectedRings, 'shell_network');

    // 3. Ensure ALL ring members appear in suspicious_accounts
    //    Members not already flagged by scoring get a floor score derived
    //    from their ring's risk_score.
    for (const ring of formattedRings) {
        for (const memberId of ring.member_accounts) {
            if (!accountMap.has(memberId)) {
                // Assign a floor score: ring risk_score * 0.6, minimum 20
                const floorScore = Math.max(20, parseFloat((ring.risk_score * 0.6).toFixed(1)));

                const newAcc = {
                    account_id: memberId,
                    suspicion_score: floorScore,
                    detected_patterns: [ring.pattern_type],
                    ring_ids: [ring.ring_id]
                };

                accountMap.set(memberId, newAcc);
            } else {
                // Account exists but may not reference this ring
                const existing = accountMap.get(memberId);
                if (!existing.ring_ids) existing.ring_ids = [];
                if (!existing.ring_ids.includes(ring.ring_id)) {
                    existing.ring_ids.push(ring.ring_id);
                }
            }
        }
    }

    // Recalculate ring risk scores now that all members have scores
    for (const ring of formattedRings) {
        let totalScore = 0;
        ring.member_accounts.forEach(memberId => {
            const acc = accountMap.get(memberId);
            if (acc) totalScore += acc.suspicion_score;
        });
        ring.risk_score = parseFloat((totalScore / ring.member_accounts.length).toFixed(1));
    }

    // 4. Format Suspicious Accounts
    const allAccounts = Array.from(accountMap.values());

    const formattedAccounts = allAccounts.map(acc => {
        // Determine primary ring_id (highest risk_score ring)
        let primaryRingId = null;
        let maxRingScore = -1;

        formattedRings.forEach(ring => {
            if (ring.member_accounts.includes(acc.account_id)) {
                if (ring.risk_score > maxRingScore) {
                    maxRingScore = ring.risk_score;
                    primaryRingId = ring.ring_id;
                }
            }
        });

        // Include timestamps from accountStats if available
        const stats = accountStats[acc.account_id];
        const firstSeen = stats?.firstTransaction ? new Date(stats.firstTransaction).toISOString() : null;
        const lastSeen = stats?.lastTransaction ? new Date(stats.lastTransaction).toISOString() : null;

        return {
            account_id: acc.account_id,
            suspicion_score: parseFloat(acc.suspicion_score.toFixed ? acc.suspicion_score.toFixed(1) : acc.suspicion_score),
            detected_patterns: acc.detected_patterns,
            ring_id: primaryRingId,
            first_seen: firstSeen,
            last_seen: lastSeen
        };
    });

    // Sort by suspicion_score descending
    formattedAccounts.sort((a, b) => b.suspicion_score - a.suspicion_score);

    // 5. Summary
    const summary = {
        total_accounts_analyzed: totalAccounts,
        suspicious_accounts_flagged: formattedAccounts.length,
        fraud_rings_detected: formattedRings.length,
        processing_time_seconds: parseFloat(processingTimeSeconds.toFixed(1))
    };

    return {
        suspicious_accounts: formattedAccounts,
        fraud_rings: formattedRings,
        summary: summary
    };
};
