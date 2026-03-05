import logger from './logger'

/**
 * Higher-Order Function to trace execution of async functions per GOV-006 §8.1.
 * Logs `.enter` with inputs, and `.exit` or `.exception` with elapsed execution time.
 * 
 * @param eventName The base dot-separated event name (e.g. 'auth.login')
 * @param fn The asynchronous function to execute and trace
 */
export function withTrace<T, A extends any[]>(
    eventName: string,
    fn: (...args: A) => Promise<T>
): (...args: A) => Promise<T> {
    return async (...args: A): Promise<T> => {
        logger.trace({ args_count: args.length, step: 'enter' }, `${eventName}.enter`)
        const start = performance.now()

        try {
            const result = await fn(...args)
            const elapsed = performance.now() - start
            logger.trace({ elapsed_ms: Math.round(elapsed), success: true, step: 'exit' }, `${eventName}.exit`)
            return result
        } catch (error) {
            const elapsed = performance.now() - start
            logger.error(
                { elapsed_ms: Math.round(elapsed), error: error instanceof Error ? error.message : String(error), step: 'exception' },
                `${eventName}.exception`
            )
            throw error
        }
    }
}
