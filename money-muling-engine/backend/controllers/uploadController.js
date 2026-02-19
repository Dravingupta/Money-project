import { parseAndValidateCsv } from '../services/csvService.js';
import { buildGraph } from '../services/graphBuilder.js';
import { detectCycles } from '../services/cycleDetector.js';
import { detectSmurfing } from '../services/smurfingDetector.js';
import { detectShellNetworks } from '../services/shellDetector.js';
import { calculateSuspicionScores } from '../services/scoringEngine.js';
import { generateFinalOutput } from '../utils/outputFormatter.js';
import { resetRingIdCounter } from '../utils/ringIdGenerator.js';

export const uploadFile = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded.' });
        }

        const start = Date.now();
        resetRingIdCounter();

        const csvResult = await parseAndValidateCsv(req.file.buffer);
        const graphData = buildGraph(csvResult.transactions);
        const cycleResults = detectCycles(graphData.adjacencyList);
        const smurfResults = detectSmurfing(csvResult.transactions);
        const shellResults = detectShellNetworks(graphData.adjacencyList, graphData.accountStats, cycleResults);

        const scoringResults = calculateSuspicionScores({
            accountStats: graphData.accountStats,
            cycleResults,
            smurfResults,
            shellResults,
            transactionsByAccount: graphData.transactionsByAccount
        });

        const raw = (Date.now() - start) / 1000;
        const processingTimeSeconds = Number(Math.max(0.1, raw).toFixed(1));

        const finalOutput = generateFinalOutput({
            suspiciousAccounts: scoringResults.suspiciousAccounts,
            cycleResults,
            smurfResults,
            shellResults,
            totalAccounts: graphData.totalAccounts,
            processingTimeSeconds
        });

        res.status(200).json(finalOutput);
    } catch (error) {
        if (error.message === 'CSV Validation Failed') {
            return res.status(400).json({ error: error.message, details: error.details });
        }
        // Pass to global error handler for 500s
        next(error);
    }
};
