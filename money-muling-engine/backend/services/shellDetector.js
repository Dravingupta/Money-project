import { generateRingId } from '../utils/ringIdGenerator.js';

/**
 * Detects Layered Shell Networks — directed chains of 3+ hops
 * where intermediate accounts have low transaction counts (≤ 3).
 *
 * Algorithm:
 *   1. Identify candidate "shell" accounts (≤ 3 total transactions).
 *   2. DFS along directed edges, tracking chains where intermediates are shells.
 *   3. Keep chains with ≥ 3 edges (4+ nodes).
 *   4. De-duplicate and exclude chains that are subsets of cycle rings.
 *
 * @param {Object} adjacencyList - Directed graph adjacency list.
 * @param {Object} accountStats  - Per-account statistics.
 * @param {Object} cycleResults  - Previously detected cycle rings.
 * @returns {Object} - Detected shell network rings.
 */
export const detectShellNetworks = (adjacencyList, accountStats, cycleResults) => {
    const detectedRings = [];
    const uniqueRingKeys = new Set();
    const accountsInShellNetworks = new Set();

    const SHELL_TX_THRESHOLD = 3;   // Intermediate must have ≤ this many txs
    const MIN_CHAIN_EDGES = 3;      // 3+ hops (edges), so ≥ 4 nodes
    const MAX_CHAIN_DEPTH = 6;      // Don't explore chains longer than 6 hops

    // 1. Build set of cycle ring member sets to skip duplicates
    const cycleAccountSets = [];
    if (cycleResults && cycleResults.detectedRings) {
        for (const ring of cycleResults.detectedRings) {
            cycleAccountSets.push(new Set(ring.member_accounts));
        }
    }

    // 2. Identify shell candidates (low activity accounts)
    const shellCandidates = new Set();
    for (const [accId, stats] of Object.entries(accountStats)) {
        if (stats.totalTransactions <= SHELL_TX_THRESHOLD) {
            shellCandidates.add(accId);
        }
    }

    // 3. DFS to find directed chains where intermediates are shell accounts
    const allChains = [];

    const dfs = (node, path, visited) => {
        if (path.length - 1 >= MIN_CHAIN_EDGES) {
            // Valid chain found (path has ≥ 4 nodes → ≥ 3 edges)
            allChains.push([...path]);
        }

        if (path.length > MAX_CHAIN_DEPTH) return;

        const neighbors = adjacencyList[node] || [];
        for (const neighbor of neighbors) {
            if (visited.has(neighbor)) continue;

            // Intermediate nodes (not first in chain) must be shell candidates
            // The neighbor becomes an intermediate if the chain continues past it,
            // but we also accept it as a valid chain endpoint.
            // Key rule: all INTERMEDIATE nodes (index 1 to path.length-1 in the
            // final chain) must be shell candidates. Since we build incrementally,
            // the CURRENT node (which is about to become intermediate if we extend)
            // must be a shell candidate — unless it's the start node.
            if (path.length >= 2) {
                // The current tail of path (node) is about to become intermediate
                // Check that it IS a shell candidate
                if (!shellCandidates.has(node)) continue;
            }

            visited.add(neighbor);
            path.push(neighbor);
            dfs(neighbor, path, visited);
            path.pop();
            visited.delete(neighbor);
        }
    };

    // Start DFS from every node
    const allNodes = Object.keys(adjacencyList);
    for (const startNode of allNodes) {
        dfs(startNode, [startNode], new Set([startNode]));
    }

    // 4. Filter and de-duplicate chains
    for (const chain of allChains) {
        // Verify all intermediates (indices 1 to len-2) are shell candidates
        let validIntermediates = true;
        for (let i = 1; i < chain.length - 1; i++) {
            if (!shellCandidates.has(chain[i])) {
                validIntermediates = false;
                break;
            }
        }
        if (!validIntermediates) continue;

        const sortedMembers = [...chain].sort();
        const ringKey = sortedMembers.join('|');

        // Skip duplicates
        if (uniqueRingKeys.has(ringKey)) continue;

        // Skip if this chain's members are a subset of (or identical to) a cycle ring
        const chainSet = new Set(chain);
        let isCycleSubset = false;
        for (const cycleSet of cycleAccountSets) {
            if (chainSet.size <= cycleSet.size && [...chainSet].every(a => cycleSet.has(a))) {
                isCycleSubset = true;
                break;
            }
        }
        if (isCycleSubset) continue;

        uniqueRingKeys.add(ringKey);

        detectedRings.push({
            ring_id: generateRingId(),
            member_accounts: sortedMembers,
            pattern_type: 'shell_network'
        });

        sortedMembers.forEach(acc => accountsInShellNetworks.add(acc));
    }

    return {
        detectedRings,
        accountsInShellNetworks: Array.from(accountsInShellNetworks)
    };
};
