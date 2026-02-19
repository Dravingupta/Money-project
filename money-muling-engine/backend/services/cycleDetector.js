import { generateRingId } from '../utils/ringIdGenerator.js';

/**
 * Detects directed cycles of length 3 to 5 in the graph.
 * @param {Object} adjacencyList - The graph adjacency list.
 * @returns {Object} - Detected rings and accounts involved.
 */
export const detectCycles = (adjacencyList) => {
    const detectedRings = [];
    const uniqueRingKeys = new Set();
    const accountsInCycles = new Set();

    // We need to iterate over all nodes.
    // adjacencyList is an Object based on previous step.
    const nodes = Object.keys(adjacencyList);

    // DFS function
    const dfs = (startNode, currentNode, path, visited) => {
        // Stop if path length exceeds 5 (startNode included in path count conceptually, 
        // but here path usually holds [start, ...intermediates])
        // If path has [A, B, C, D, E], length is 5. Next step to A makes it length 6 cycle if we count edges.
        // Requirement: "Detect directed cycles of length 3 to 5 (inclusive)."
        // Length usually means number of edges.
        // A->B->C->A is length 3. Nodes: A, B, C.
        // Path so far: [A, B, C]. Next is A.

        if (path.length > 5) return;

        const neighbors = adjacencyList[currentNode] || [];

        for (const neighbor of neighbors) {
            if (neighbor === startNode) {
                // Cycle detected
                // Check length: if path has [A, B, C], and we go back to A, length is 3.
                if (path.length >= 3 && path.length <= 5) {
                    // Normalize cycle
                    const cycleNodes = [...path];
                    const sortedNodes = [...cycleNodes].sort();
                    const pKey = sortedNodes.join('|');

                    if (!uniqueRingKeys.has(pKey)) {
                        uniqueRingKeys.add(pKey);

                        detectedRings.push({
                            ring_id: generateRingId(),
                            member_accounts: sortedNodes,
                            pattern_type: 'cycle',
                        });

                        // Track accounts
                        cycleNodes.forEach(acc => accountsInCycles.add(acc));
                    }
                }
            } else if (!visited.has(neighbor)) {
                // Continue DFS if not visited in current path
                // We pass a new Set for visited to simulate "visited per path" efficiently 
                // or just add/delete from the same set if we were doing single path, 
                // but here we branch, so new Set or tracking stack is needed.
                // Actually, since this is a recursive DFS where we want to avoid cycles *within the path being explored* 
                // that are NOT the start node (i.e. to avoid loops that don't return to start),
                // we check `visited`.

                // Optimisation: We only care about cycles returning to `startNode`.
                // We limit depth to 5.

                visited.add(neighbor);
                path.push(neighbor);

                dfs(startNode, neighbor, path, visited);

                path.pop();
                visited.delete(neighbor);
            }
        }
    };

    for (const node of nodes) {
        // To avoid finding the same cycle multiple times from different start nodes (A->B->C vs B->C->A),
        // we have the uniqueRingKeys check. 
        // However, for performance, we could enforce startNode is the "smallest" node, 
        // but the prompt asks for "Different rotations of same cycle must count as ONE ring" and suggests normalization.
        // So iterating all nodes is fine as long as we deduplicate.

        // We pass a new Set meant for the current path
        dfs(node, node, [node], new Set([node]));
    }

    return {
        detectedRings,
        accountsInCycles: Array.from(accountsInCycles) // Convert Set to Array for JSON output
    };
};
