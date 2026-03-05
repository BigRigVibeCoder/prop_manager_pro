'use client'

import { useEffect } from 'react'
import { handleError } from '@/lib/errors/handlers'
import { ErrorCategory } from '@/lib/errors/types'

// This global-error boundary wraps the *entire* HTML document to catch catastrophic layout failures
export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        // Elevate severity of root HTML crashes to FATAL
        handleError(error, {
            component: 'Next.js Root HTML Boundary',
            category: ErrorCategory.FATAL
        })
    }, [error])

    return (
        <html lang="en">
            <body>
                <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center bg-black text-white">
                    <h1 className="text-4xl font-extrabold text-red-500 mb-4">
                        System Failure
                    </h1>
                    <p className="text-gray-400 max-w-md mb-8">
                        The application has encountered a catastrophic unhandled fault.
                        Telemetry has documented the execution state. Please refresh the window.
                    </p>
                    <button
                        onClick={() => reset()}
                        className="px-6 py-3 bg-red-600 hover:bg-red-700 font-bold rounded"
                    >
                        Reinitialize System
                    </button>
                </div>
            </body>
        </html>
    )
}
