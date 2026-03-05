import { ErrorCategory, type ErrorContext } from './types'

/**
 * GOV-004 §3.2 ApplicationError Base Class
 * Ensures all thrown exceptions conform to the strict CODEX context payload.
 */
export class ApplicationError extends Error {
    public readonly context: ErrorContext
    public readonly cause?: Error

    constructor(message: string, context: Partial<ErrorContext> = {}, cause?: Error) {
        super(message)
        this.name = 'ApplicationError'

        // Auto-generate errorId matching the standard: err-xxxxxxxxxxxx
        const uuid = crypto.randomUUID() || 'unknown-uuid'
        const shortId = `err-${uuid.substring(0, 12)}`

        this.context = {
            errorId: context.errorId ?? shortId,
            category: context.category ?? ErrorCategory.UNKNOWN,
            retryable: context.retryable ?? false,
            ...context,
        }

        this.cause = cause

        // Fix prototype chain for instanceof checks
        Object.setPrototypeOf(this, ApplicationError.prototype)
    }

    /**
     * Serializes the error into a JSON-friendly object for the Pino logger
     */
    public toJSON() {
        return {
            name: this.name,
            message: this.message,
            stack: this.stack,
            context: this.context,
            cause: this.cause ? String(this.cause) : undefined,
        }
    }
}
