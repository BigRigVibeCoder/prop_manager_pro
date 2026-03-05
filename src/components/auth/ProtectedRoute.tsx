'use client'

interface ProtectedRouteProps {
    children: React.ReactNode
    fallbackUrl?: string
}

/**
 * Temporarily disabled for public production testing.
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
    return <>{children}</>
}
