import logger from '@/lib/logger'
import { ApplicationError } from './ApplicationError'
import { ErrorCategory } from './types'

/**
 * Normalizes any caught `unknown` error into a strict GOV-004 `ApplicationError`.
 * If it's already an ApplicationError, it passes it through.
 */
export function normalizeError(err: unknown): ApplicationError {
    if (err instanceof ApplicationError) {
        return err
    }

    if (err instanceof Error) {
        return new ApplicationError(err.message, { category: ErrorCategory.UNKNOWN }, err)
    }

    return new ApplicationError(String(err), { category: ErrorCategory.UNKNOWN })
}

/**
 * The standard exception handler. 
 * Formats the ApplicationError into the expected JSON structure and passes to Pino.
 * 
 * @param err The caught exception
 * @param overrides Optional context overrides (e.g. current component or operation)
 */
export function handleError(err: unknown, overrides?: Partial<ApplicationError['context']>) {
    const applicationError = normalizeError(err)

    if (overrides) {
        Object.assign(applicationError.context, overrides)
    }

    // GOV-004 §3 Mapping: Level 1 CATASTROPHIC, Level 2 HAZARDOUS, Level 3 MAJOR (etc)
    const isFatal = [
        ErrorCategory.FATAL,
        ErrorCategory.HARDWARE,
        ErrorCategory.INFRASTRUCTURE
    ].includes(applicationError.context.category)

    const logPayload = {
        error_id: applicationError.context.errorId,
        category: applicationError.context.category,
        component: applicationError.context.component,
        correlation_id: applicationError.context.correlationId,
        retryable: applicationError.context.retryable,
        error: applicationError.message,
        stack_trace: applicationError.stack,
        cause: applicationError.cause?.message
    }

    if (isFatal) {
        logger.fatal(logPayload, 'application.error.fatal')
    } else {
        logger.error(logPayload, 'application.error')
    }

    return applicationError
}
