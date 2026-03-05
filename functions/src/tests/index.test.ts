import { describe, it, expect, vi } from 'vitest';
import admin from 'firebase-admin';
import pino from 'pino';
import { updatePortfolioKPIs } from '../index.js';

// Mock Firebase Admin and Pino
vi.mock('firebase-admin', () => {
    const firestoreMock = {
        collection: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        get: vi.fn().mockResolvedValue({
            size: 2,
            forEach: (cb: unknown) => {
                const callback = cb as (doc: unknown) => void;
                callback({ data: () => ({ amount: 1000, type: 'revenue', status: 'paid' }) });
                callback({ data: () => ({ amount: 500, type: 'revenue', status: 'unpaid' }) });
            }
        }),
        doc: vi.fn().mockReturnThis(),
        set: vi.fn().mockResolvedValue(true)
    };

    const adminMock = {
        initializeApp: vi.fn(),
        firestore: Object.assign(() => firestoreMock, {
            FieldValue: { serverTimestamp: vi.fn().mockReturnValue('mocked_timestamp') }
        })
    };

    return {
        ...adminMock,
        default: adminMock
    };
});

vi.mock('pino', () => {
    const loggerMock = {
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
        fatal: vi.fn()
    };
    const pinoMock = Object.assign(() => loggerMock, {
        stdTimeFunctions: { isoTime: vi.fn() }
    });
    return {
        ...pinoMock,
        default: pinoMock
    };
});

vi.mock('firebase-functions/v2/firestore', () => ({
    onDocumentWritten: vi.fn((path, handler) => handler)
}));

describe('updatePortfolioKPIs', () => {
    it('should abort and log warning if ownerId is missing', async () => {
        const logger = pino();
        const event = { id: 'evt_123', data: { after: { exists: true, data: () => ({ amount: 50 }) } } };

        const handler = updatePortfolioKPIs as unknown as (e: unknown) => Promise<void>;
        await handler(event);

        expect(logger.warn).toHaveBeenCalledWith(
            expect.objectContaining({ eventId: 'evt_123' }),
            "Missing ownerId on ledger trigger. Aborting aggregation."
        );
    });

    it('should calculate revenue and outstanding balances', async () => {
        const logger = pino();
        const db = admin.firestore() as any;
        const event = {
            id: 'evt_456',
            data: { after: { exists: true, data: () => ({ ownerId: 'owner_123', amount: 100 }) } }
        };

        const handler = updatePortfolioKPIs as unknown as (e: unknown) => Promise<void>;
        await handler(event);

        expect(db.collection).toHaveBeenCalledWith('portfolio_stats');
        expect(db.doc).toHaveBeenCalledWith('owner_123');
        expect(db.set).toHaveBeenCalledWith({
            totalRevenue: 1500,
            outstandingBalances: 500,
            lastCalculated: 'mocked_timestamp'
        }, { merge: true });

        expect(logger.info).toHaveBeenCalledWith(
            expect.objectContaining({ ownerId: 'owner_123', processedLedgers: 2 }),
            "Successfully aggregated ledgers."
        );
    });

    it('should handle exceptions gracefully with strict ApplicationError logging', async () => {
        const logger = pino();
        const db = admin.firestore() as any;
        const dbSet = db.set as { mockRejectedValueOnce: (err: Error) => void };
        dbSet.mockRejectedValueOnce(new Error('Firestore down'));

        const event = {
            data: { before: { data: () => ({ ownerId: 'owner_fail' }) }, after: { exists: false } }
        };

        const handler = updatePortfolioKPIs as unknown as (e: unknown) => Promise<void>;
        await handler(event);

        expect(logger.error).toHaveBeenCalledWith(
            expect.objectContaining({ ownerId: 'owner_fail', error: 'Firestore down' }),
            "Failed to aggregate portfolio KPIs."
        );
    });
});
