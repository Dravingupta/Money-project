import csv from 'csv-parser';
import { Readable } from 'stream';

/**
 * Validates a single transaction row.
 * @param {Object} row - The transaction row.
 * @returns {string|null} - Error message if invalid, null otherwise.
 */
const validateRow = (row) => {
    const { transaction_id, sender_id, receiver_id, amount, timestamp } = row;

    if (!transaction_id || typeof transaction_id !== 'string') return `Invalid transaction_id: ${transaction_id}`;
    if (!sender_id || typeof sender_id !== 'string') return `Invalid sender_id: ${sender_id}`;
    if (!receiver_id || typeof receiver_id !== 'string') return `Invalid receiver_id: ${receiver_id}`;

    const amountFloat = parseFloat(amount);
    if (isNaN(amountFloat) || amountFloat < 0) return `Invalid amount: ${amount}`;

    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return `Invalid timestamp: ${timestamp}`;

    return null;
};

/**
 * Parses and validates a CSV buffer.
 * @param {Buffer} buffer - The CSV file buffer.
 * @returns {Promise<Object>} - The parsing result or error.
 */
export const parseAndValidateCsv = (buffer) => {
    return new Promise((resolve, reject) => {
        const results = [];
        const errors = [];
        let rowCount = 0;

        const stream = Readable.from(buffer.toString());

        stream
            .pipe(csv())
            .on('data', (row) => {
                rowCount++;

                // Basic schema check
                if (!row.transaction_id || !row.sender_id || !row.receiver_id || !row.amount || !row.timestamp) {
                    errors.push(`Row ${rowCount}: Missing required fields`);
                    return;
                }

                const validationError = validateRow(row);
                if (validationError) {
                    errors.push(`Row ${rowCount}: ${validationError}`);
                } else {
                    results.push({
                        transaction_id: row.transaction_id,
                        sender_id: row.sender_id,
                        receiver_id: row.receiver_id,
                        amount: parseFloat(row.amount),
                        timestamp: new Date(row.timestamp),
                    });
                }
            })
            .on('end', () => {
                if (errors.length > 0) {
                    reject({ message: 'CSV Validation Failed', details: errors });
                } else if (results.length === 0) {
                    reject({ message: 'CSV Validation Failed', details: ['File is empty or has no valid rows'] });
                } else {
                    resolve({
                        success: true,
                        total_transactions: results.length,
                        message: 'CSV parsed successfully',
                        sample_preview: results.slice(0, 5),
                        transactions: results,
                    });
                }
            })
            .on('error', (error) => {
                reject({ message: 'CSV Parsing Error', error: error.message });
            });
    });
};
