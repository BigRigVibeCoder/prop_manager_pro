import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import ErrorBoundary from '@/app/error'
import GlobalError from '@/app/global-error'
import { handleError } from '@/lib/errors/handlers'

// Mock the error handler to prevent actual logging during test runs
vi.mock('@/lib/errors/handlers', () => ({
    handleError: vi.fn(),
}))

describe('Next.js Error Boundaries', () => {

    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('ErrorBoundary (app/error.tsx)', () => {
        it('renders the fallback UI and calls the handleError GOV-004 routing telemetry', () => {
            const mockError = new Error('Test rendering crash')
            const mockReset = vi.fn()

            render(<ErrorBoundary error={mockError} reset={mockReset} />)

            // Test 1: Ensure it calls the error routing handler
            expect(handleError).toHaveBeenCalledTimes(1)
            expect(handleError).toHaveBeenCalledWith(mockError, { component: 'Next.js App Router Boundary' })

            // Test 2: Ensure the fallback UI renders correctly
            expect(screen.getByText(/We encountered an application error/i)).toBeInTheDocument()

            // Test 3: Ensure the recovery button works (GOV-004 User Recovery Strategy)
            const retryButton = screen.getByRole('button', { name: /Try Again/i })
            fireEvent.click(retryButton)
            expect(mockReset).toHaveBeenCalledTimes(1)
        })
    })

    describe('GlobalError (app/global-error.tsx)', () => {
        it('renders the fatal HTML fallback and routes a FATAL exception context', () => {
            const mockError = new Error('Catastrophic root crash')
            const mockReset = vi.fn()

            render(<GlobalError error={mockError} reset={mockReset} />)

            // Test 1: Ensure it calls the error routing handler with FATAL escalation
            expect(handleError).toHaveBeenCalledTimes(1)
            expect(handleError).toHaveBeenCalledWith(mockError, expect.objectContaining({
                component: 'Next.js Root HTML Boundary',
                category: 'FATAL'
            }))

            // Test 2: Ensure the HTML boundary fallback renders correctly
            expect(screen.getByText(/System Failure/i)).toBeInTheDocument()

            // Test 3: Ensure the recovery button triggers the reset prop
            const retryButton = screen.getByRole('button', { name: /Reinitialize System/i })
            fireEvent.click(retryButton)
            expect(mockReset).toHaveBeenCalledTimes(1)
        })
    })
})
