'use client' // Error boundaries must be Client Components

import { useEffect } from 'react'
import { handleError } from '@/lib/errors/handlers'

export default function ErrorBoundary({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        // Log the error to our structured GOV-006 Pino logger
        handleError(error, { component: 'Next.js App Router Boundary' })
    }, [error])

    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center bg-destructive/10 rounded-lg outline-destructive/50 outline-1">
            <h2 className="text-2xl font-bold text-destructive mb-4">
                We encountered an application error.
            </h2>
            <p className="text-muted-foreground mb-6 max-w-md">
                An unexpected problem occurred. The issue has been registered, classified, and our telemetry systems have notified the on-call engineers.
            </p>

            {/* GOV-004 §7 Recovery Strategies: Provide the user an explicit retry mechanism */}
            <button
                onClick={() => reset()}
                className="px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-md shadow hover:bg-primary/90 transition-colors"
            >
                Try Again
            </button>
        </div>
    )
}
