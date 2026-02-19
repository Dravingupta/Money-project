import { generateRingId } from '../utils/ringIdGenerator.js';

/**
 * Detects Smurfing patterns (Fan-In/Fan-Out).
 * Rules: 10+ unique accounts within 72-hour window.
 * Includes merchant / payroll false-positive filter.
 * @param {Array} transactions - List of transactions.
 * @returns {Object} - Detected smurfing rings.
 */
export const detectSmurfing = (transactions) => {
    const detectedRings = [];
    const accountsInSmurfing = new Set();
    const WINDOW_MS = 72 * 60 * 60 * 1000; // 72 hours
    const THRESHOLD = 10;

    // Helpers to group transactions
    const sentByAccount = new Map(); // Key: sender, Value: Array of txs
    const receivedByAccount = new Map(); // Key: receiver, Value: Array of txs

    // 1. Group transactions
    for (const tx of transactions) {
        if (!sentByAccount.has(tx.sender_id)) sentByAccount.set(tx.sender_id, []);
        sentByAccount.get(tx.sender_id).push(tx);

        if (!receivedByAccount.has(tx.receiver_id)) receivedByAccount.set(tx.receiver_id, []);
        receivedByAccount.get(tx.receiver_id).push(tx);
    }

    /**
     * Sliding-window detection that collects ALL counterparts across
     * every valid window (not just the first window that meets threshold).
     */
    const checkSlidingWindow = (mainAccount, txs, type) => {
        txs.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

        let left = 0;
        const uniqueCounterparts = new Map(); // Counterpart ID -> count in current window
        const allCounterparts = new Set();    // Accumulate across ALL valid windows
        let foundAny = false;

        for (let right = 0; right < txs.length; right++) {
            const rightTx = txs[right];
            const rightTime = new Date(rightTx.timestamp).getTime();
            const counterpart = type === 'fan_out' ? rightTx.receiver_id : rightTx.sender_id;

            // Add to window
            uniqueCounterparts.set(counterpart, (uniqueCounterparts.get(counterpart) || 0) + 1);

            // Shrink window from left
            while (rightTime - new Date(txs[left].timestamp).getTime() > WINDOW_MS) {
                const leftTx = txs[left];
                const leftCounterpart = type === 'fan_out' ? leftTx.receiver_id : leftTx.sender_id;

                const count = uniqueCounterparts.get(leftCounterpart);
                if (count === 1) {
                    uniqueCounterparts.delete(leftCounterpart);
                } else {
                    uniqueCounterparts.set(leftCounterpart, count - 1);
                }
                left++;
            }

            // If this window meets threshold, collect ALL counterparts in it
            if (uniqueCounterparts.size >= THRESHOLD) {
                foundAny = true;
                for (const cp of uniqueCounterparts.keys()) {
                    allCounterparts.add(cp);
                }
            }
        }

        if (!foundAny) return null;

        const memberAccounts = Array.from(allCounterparts);
        memberAccounts.push(mainAccount);
        memberAccounts.sort();
        return memberAccounts;
    };

    /**
     * Merchant / payroll false-positive filter.
     * Returns true if the hub account looks like a legitimate business:
     *   - Only receives (zero fan-out)  AND
     *   - Average amount is small (<1000)  AND  amounts are varied
     * OR
     *   - Only sends (zero fan-in for payroll)  AND  regular cadence
     */
    const isLegitimateHub = (mainAccount, type) => {
        const sent = sentByAccount.get(mainAccount) || [];
        const received = receivedByAccount.get(mainAccount) || [];

        if (type === 'fan_in') {
            // Hub receives from many — check if it ever sends onward
            if (sent.length > 0) return false; // Has fan-out leg → could be smurfing aggregator

            // All-receive hub: check if amounts look like retail purchases
            const amounts = received.map(tx => tx.amount);
            const avg = amounts.reduce((a, b) => a + b, 0) / amounts.length;
            if (avg >= 1000) return false; // Large average → suspicious

            // Check variance — merchants have varied amounts
            const variance = amounts.reduce((sum, a) => sum + (a - avg) ** 2, 0) / amounts.length;
            const stdDev = Math.sqrt(variance);
            const cv = avg > 0 ? stdDev / avg : 0; // coefficient of variation
            if (cv > 0.15) return true; // High variability → retail-like → legitimate

            return false;
        }

        if (type === 'fan_out') {
            // Hub sends to many — check if it ever receives (payroll pattern)
            if (received.length > 0) return false;

            // All-send hub: check if amounts are uniform (payroll)
            const amounts = sent.map(tx => tx.amount);
            const avg = amounts.reduce((a, b) => a + b, 0) / amounts.length;
            const variance = amounts.reduce((sum, a) => sum + (a - avg) ** 2, 0) / amounts.length;
            const stdDev = Math.sqrt(variance);
            const cv = avg > 0 ? stdDev / avg : 0;
            if (cv < 0.1) return true; // Very uniform amounts → payroll-like → legitimate

            return false;
        }

        return false;
    };

    // Track unique ring keys to prevent duplicate reports
    const distinctRings = new Set();

    // 2. Detect Fan-Out (One Sender -> Many Receivers)
    for (const [sender, txs] of sentByAccount) {
        const members = checkSlidingWindow(sender, txs, 'fan_out');
        if (members) {
            if (isLegitimateHub(sender, 'fan_out')) continue;

            const ringKey = members.join('|');
            if (!distinctRings.has(ringKey)) {
                distinctRings.add(ringKey);

                detectedRings.push({
                    ring_id: generateRingId(),
                    member_accounts: members,
                    pattern_type: 'smurfing_fan_out',
                    main_account: sender
                });

                members.forEach(acc => accountsInSmurfing.add(acc));
            }
        }
    }

    // 3. Detect Fan-In (Many Senders -> One Receiver)
    for (const [receiver, txs] of receivedByAccount) {
        const members = checkSlidingWindow(receiver, txs, 'fan_in');
        if (members) {
            if (isLegitimateHub(receiver, 'fan_in')) continue;

            const ringKey = members.join('|');
            if (!distinctRings.has(ringKey)) {
                distinctRings.add(ringKey);

                detectedRings.push({
                    ring_id: generateRingId(),
                    member_accounts: members,
                    pattern_type: 'smurfing_fan_in',
                    main_account: receiver
                });

                members.forEach(acc => accountsInSmurfing.add(acc));
            }
        }
    }

    return {
        detectedRings,
        accountsInSmurfing: Array.from(accountsInSmurfing)
    };
};
