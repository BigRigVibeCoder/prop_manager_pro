import { render, screen, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AuthProvider, useAuth } from '@/lib/auth/AuthContext'
import { onAuthStateChanged } from 'firebase/auth'

// Mock Firebase Auth
vi.mock('firebase/auth', () => ({
    getAuth: vi.fn(),
    onAuthStateChanged: vi.fn(),
}))

vi.mock('@/lib/firebase/config', () => ({
    auth: {},
}))

vi.mock('@/lib/trace', () => ({
    withTrace: (name: string, fn: any) => fn
}))

// Use hoisted to ensure it's available before vi.mock executes
const { mockLoggerError } = vi.hoisted(() => ({
    mockLoggerError: vi.fn()
}))

// Mock Logger to prevent test noise
vi.mock('@/lib/logger', () => ({
    default: { info: vi.fn(), error: mockLoggerError }
}))

// Test Component accessing the Context
const TestConsumer = () => {
    const { user, loading } = useAuth()
    return (
        <div>
            <span data-testid="loading-state">{loading.toString()}</span>
            <span data-testid="user-state">{user ? user.uid : 'null'}</span>
        </div>
    )
}

describe('AuthProvider & Context (SPR-003)', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        mockLoggerError.mockClear()
    })

    it('initializes in loading state and registers observer', async () => {
        vi.mocked(onAuthStateChanged).mockImplementation(() => vi.fn())

        render(
            <AuthProvider>
                <TestConsumer />
            </AuthProvider>
        )

        expect(screen.getByTestId('loading-state')).toHaveTextContent('true')
        expect(screen.getByTestId('user-state')).toHaveTextContent('null')
        expect(onAuthStateChanged).toHaveBeenCalledTimes(1)
    })

    it('updates state to authenticated when Firebase returns a User', async () => {
        let triggerAuth: any = null
        vi.mocked(onAuthStateChanged).mockImplementation((auth, callback) => {
            triggerAuth = callback
            return vi.fn()
        })

        render(
            <AuthProvider>
                <TestConsumer />
            </AuthProvider>
        )

        await act(async () => {
            if (triggerAuth) triggerAuth({ uid: 'user_123' })
        })

        expect(screen.getByTestId('loading-state')).toHaveTextContent('false')
        expect(screen.getByTestId('user-state')).toHaveTextContent('user_123')
    })

    it('updates state to unauthenticated when Firebase returns null', async () => {
        let triggerAuth: any = null
        vi.mocked(onAuthStateChanged).mockImplementation((auth, callback) => {
            triggerAuth = callback
            return vi.fn()
        })

        render(
            <AuthProvider>
                <TestConsumer />
            </AuthProvider>
        )

        await act(async () => {
            if (triggerAuth) triggerAuth(null)
        })

        expect(screen.getByTestId('loading-state')).toHaveTextContent('false')
        expect(screen.getByTestId('user-state')).toHaveTextContent('null')
    })

    it('handles initialization errors securely without hanging user on loading screen', async () => {
        // Force the async trace wrapper to throw, triggering the Promise.catch handler
        vi.mocked(onAuthStateChanged).mockImplementation(() => {
            throw new Error('Simulated initialization crash')
        })

        render(
            <AuthProvider>
                <TestConsumer />
            </AuthProvider>
        )

        // Await microtasks for the .catch() to resolve state
        await act(async () => {
            await new Promise(resolve => setTimeout(resolve, 0))
        })

        // The component should log the error and drop loading state to unblock UI
        expect(mockLoggerError).toHaveBeenCalledWith(
            expect.objectContaining({ component: 'AuthProvider' }),
            'Failed to initialize Auth listener'
        )
        expect(screen.getByTestId('loading-state')).toHaveTextContent('false')
    })
})
