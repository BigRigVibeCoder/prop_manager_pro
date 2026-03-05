/**
 * GOV-004 §2 Error Taxonomy
 * All errors are classified by Category. This drives automated recovery decisions.
 */
export enum ErrorCategory {
    VALIDATION = 'VALIDATION',
    BUSINESS_LOGIC = 'BUSINESS_LOGIC',
    EXTERNAL_SERVICE = 'EXTERNAL_SERVICE',
    DATABASE = 'DATABASE',
    RESOURCE = 'RESOURCE',
    INFRASTRUCTURE = 'INFRASTRUCTURE',
    CONFIGURATION = 'CONFIGURATION',
    NETWORK = 'NETWORK',
    SECURITY = 'SECURITY',
    HARDWARE = 'HARDWARE',
    FATAL = 'FATAL',
    TRANSIENT = 'TRANSIENT',
    UNKNOWN = 'UNKNOWN',
}

/**
 * GOV-004 §3 Structured Error Context
 * Every error must carry structured context. Never throw a bare string.
 */
export interface ErrorContext {
    errorId: string
    category: ErrorCategory
    operation?: string
    component?: string
    correlationId?: string
    inputData?: Record<string, unknown>
    retryable: boolean
    // Optional but useful payload for additional context
    payload?: Record<string, unknown>
}
