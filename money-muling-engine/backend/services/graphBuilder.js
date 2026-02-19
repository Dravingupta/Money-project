/**
 * Builds a directed graph from transaction data.
 * @param {Array} transactions - List of transaction objects.
 * @returns {Object} - Graph structures and stats.
 */
export const buildGraph = (transactions) => {
    const adjacencyList = new Map();
    const reverseAdjacencyList = new Map();
    const accountStats = new Map();
    const transactionsByAccount = new Map();

    // Helper to initialize account stats if not present
    const initAccount = (accountId) => {
        if (!accountStats.has(accountId)) {
            accountStats.set(accountId, {
                inDegree: 0,
                outDegree: 0,
                totalTransactions: 0,
                totalSentAmount: 0,
                totalReceivedAmount: 0,
                firstTransaction: null,
                lastTransaction: null,
            });
            adjacencyList.set(accountId, new Set());
            reverseAdjacencyList.set(accountId, new Set());
            transactionsByAccount.set(accountId, []);
        }
    };

    for (const tx of transactions) {
        const { transaction_id, sender_id: sender, receiver_id: receiver, amount, timestamp } = tx;

        // Initialize accounts
        initAccount(sender);
        initAccount(receiver);

        // Update Adjacency Lists (Edges)
        adjacencyList.get(sender).add(receiver);
        reverseAdjacencyList.get(receiver).add(sender);

        // Update Stats - Sender
        const senderStats = accountStats.get(sender);
        senderStats.outDegree += 1;
        senderStats.totalTransactions += 1;
        senderStats.totalSentAmount += amount;

        // Update Stats - Receiver
        const receiverStats = accountStats.get(receiver);
        receiverStats.inDegree += 1;
        receiverStats.totalTransactions += 1;
        receiverStats.totalReceivedAmount += amount;

        // Update Timestamps
        const txDate = new Date(timestamp); // Assuming timestamp is already Date or valid string from CSV parser

        // Helper to update min/max dates
        const updateDates = (stats, date) => {
            if (!stats.firstTransaction || date < stats.firstTransaction) {
                stats.firstTransaction = date;
            }
            if (!stats.lastTransaction || date > stats.lastTransaction) {
                stats.lastTransaction = date;
            }
        };

        updateDates(senderStats, txDate);
        updateDates(receiverStats, txDate);

        // Store Transaction References
        transactionsByAccount.get(sender).push({ type: 'sent', ...tx });
        transactionsByAccount.get(receiver).push({ type: 'received', ...tx });
    }

    // Convert Maps to Objects for output
    const adjacencyListObj = {};
    const reverseAdjacencyListObj = {};
    const accountStatsObj = {};
    const transactionsByAccountObj = {};
    let totalEdges = 0;

    for (const [account, neighbors] of adjacencyList) {
        adjacencyListObj[account] = Array.from(neighbors);
        totalEdges += neighbors.size;
    }

    for (const [account, neighbors] of reverseAdjacencyList) {
        reverseAdjacencyListObj[account] = Array.from(neighbors);
    }

    for (const [account, stats] of accountStats) {
        accountStatsObj[account] = stats;
    }

    for (const [account, txs] of transactionsByAccount) {
        transactionsByAccountObj[account] = txs;
    }

    return {
        adjacencyList: adjacencyListObj,
        reverseAdjacencyList: reverseAdjacencyListObj,
        accountStats: accountStatsObj,
        transactionsByAccount: transactionsByAccountObj,
        totalAccounts: accountStats.size,
        totalTransactions: transactions.length,
        graphSummary: {
            total_nodes: accountStats.size,
            total_edges: totalEdges
        }
    };
};
