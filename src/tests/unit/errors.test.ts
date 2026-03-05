import { describe, it, expect, vi } from 'vitest'
import { ApplicationError } from '@/lib/errors/ApplicationError'
import { ErrorCategory } from '@/lib/errors/types'
import { handleError, normalizeError } from '@/lib/errors/handlers'
import logger from '@/lib/logger'

// Mock the pino logger to intercept the log calls during test
vi.mock('@/lib/logger', () => ({
    default: {
        error: vi.fn(),
        fatal: vi.fn(),
        trace: vi.fn(),
        info: vi.fn(),
    }
}))

describe('GOV-004 Error Handling Protocol', () => {
    describe('ApplicationError', () => {
        it('generates a formatted errorId and defaults to UNKNOWN category', () => {
            const error = new ApplicationError('Test fallback')

            expect(error.context.errorId).toMatch(/^err-/)
            expect(error.context.category).toBe(ErrorCategory.UNKNOWN)
            expect(error.message).toBe('Test fallback')
        })

        it('accepts context overrides and preserves stack chains', () => {
            const rootCause = new Error('Database disconnected')
            const appErr = new ApplicationError('Failed to save data', {
                category: ErrorCategory.DATABASE,
                component: 'DataLayer',
                retryable: true
            }, rootCause)

            expect(appErr.context.category).toBe(ErrorCategory.DATABASE)
            expect(appErr.cause).toBe(rootCause)

            const jsonStr = appErr.toJSON()
            expect(jsonStr.cause).toContain('Error: Database disconnected')
            expect(jsonStr.context.retryable).toBe(true)
        })
    })

    describe('Handlers', () => {
        it('normalizeError coerces string throws into ApplicationErrors', () => {
            const normalized = normalizeError('Something went wrong')
            expect(normalized).toBeInstanceOf(ApplicationError)
            expect(normalized.message).toBe('Something went wrong')
        })

        it('handleError funnels standard errors to Pino with correct structure', () => {
            const testErr = new Error('Runtime glitch')
            const result = handleError(testErr, { component: 'AuthService' })

            // Verification that the component context was successfully injected
            expect(result.context.component).toBe('AuthService')

            // Verification that Pino was called correctly
            expect(logger.error).toHaveBeenCalled()
            const pinoCall = vi.mocked(logger.error).mock.calls[0]
            expect(pinoCall[0]).toHaveProperty('error_id')
            expect(pinoCall[0]).toHaveProperty('stack_trace')
            expect(pinoCall[1]).toBe('application.error')
        })

        it('handleError elevates CRITICAL severity hardware/infrastructure directly to FATAL', () => {
            const fatalErr = new ApplicationError('OOM Panic', { category: ErrorCategory.INFRASTRUCTURE })
            handleError(fatalErr)

            expect(logger.fatal).toHaveBeenCalled()
            const fallbackCall = vi.mocked(logger.fatal).mock.calls[0]
            expect(fallbackCall[1]).toBe('application.error.fatal')
        })
    })
})
