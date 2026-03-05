import { onDocumentWritten } from "firebase-functions/v2/firestore";
import * as admin from "firebase-admin";
import pino from "pino";

const logger = pino({
    level: process.env.LOG_LEVEL?.toLowerCase() ?? "info",
    formatters: {
        level: (label: string) => ({ level: label.toUpperCase() }),
    },
    timestamp: pino.stdTimeFunctions.isoTime,
    base: { service: "functions-backend" },
});

process.on("uncaughtException", (error: Error) => {
    logger.fatal({ error: error.message, stack: error.stack }, "UNHANDLED EXCEPTION");
    process.exit(1);
});

process.on("unhandledRejection", (reason: unknown) => {
    logger.fatal({ reason }, "UNHANDLED PROMISE REJECTION");
    process.exit(1);
});

// Initialize the Admin SDK to bypass firestore.rules
admin.initializeApp();
const db = admin.firestore();

/**
 * Cloud Function (Sprint 4 / Task 8)
 * 
 * Automatically triggered when ANY ledger entry executes (Creation, Update, or Deletion).
 * Atomically re-calculates the entire property revenue base and applies it to a single 
 * pre-computed stats bucket for O(1) reads by the React Dashboard.
 */
export const updatePortfolioKPIs = onDocumentWritten(
    "ledgers/{ledgerId}",
    async (event) => {
        const snap = event.data;
        if (!snap) return;

        // Extract Owner ID from either the before (delete) or after (create/update) state
        const triggerDoc = snap.after.exists ? snap.after.data() : snap.before.data();
        if (!triggerDoc || !triggerDoc.ownerId) {
            logger.warn({ eventId: event.id }, "Missing ownerId on ledger trigger. Aborting aggregation.");
            return;
        }

        const ownerId = triggerDoc.ownerId;

        // Perform the heavy aggregation on the Google Cloud Backend
        try {
            const ledgersRef = db.collection("ledgers").where("ownerId", "==", ownerId);
            const snapshot = await ledgersRef.get();

            let totalRevenue = 0;
            let outstandingBalances = 0;

            snapshot.forEach((doc) => {
                const ledger = doc.data();
                if (ledger.amount && ledger.type === 'revenue') {
                    totalRevenue += ledger.amount;
                }
                if (ledger.status === 'unpaid') {
                    outstandingBalances += ledger.amount;
                }
            });

            // Fast lookup document for the UI Dashboard
            await db.collection("portfolio_stats").doc(ownerId).set({
                totalRevenue,
                outstandingBalances,
                lastCalculated: admin.firestore.FieldValue.serverTimestamp()
            }, { merge: true });

            logger.info({ ownerId, processedLedgers: snapshot.size }, "Successfully aggregated ledgers.");

        } catch (err: unknown) {
            const error = err instanceof Error ? err : new Error(String(err));
            logger.error({
                ownerId,
                error: error.message,
                stack: error.stack
            }, "Failed to aggregate portfolio KPIs.");
        }
    }
);
