import pino from 'pino';

// Define the core structured logger per GOV-006 §6.1
const logger = pino({
    level: process.env.LOG_LEVEL?.toLowerCase() ?? 'warn',
    formatters: {
        // Ensure the level is output as an uppercase string (e.g. "INFO") instead of numeric
        level: (label: string) => ({ level: label.toUpperCase() }),
    },
    timestamp: pino.stdTimeFunctions.isoTime,
    base: {
        service: process.env.SERVICE_NAME ?? 'prop-manage-pro-web',
    },
    // If LOG_FILE is defined, transmit structured JSONL to the flat file.
    // Otherwise default back to standard output.
    transport: process.env.LOG_FILE
        ? { target: 'pino/file', options: { destination: process.env.LOG_FILE } }
        : undefined,
});

export default logger;
