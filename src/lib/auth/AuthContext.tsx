'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged, User } from 'firebase/auth'
import { auth } from '@/lib/firebase/config'
import logger from '@/lib/logger'
import { withTrace } from '@/lib/trace'

interface AuthContextType {
    user: User | null
    loading: boolean
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // GOV-006: Trace the auth listener registration
        const initAuthListener = withTrace('auth.listener.init', async () => {
            logger.info({ component: 'AuthProvider' }, 'Initializing Firebase Auth observer')

            const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
                setUser(firebaseUser)
                setLoading(false)

                if (firebaseUser) {
                    logger.info({ uid: firebaseUser.uid, component: 'AuthProvider' }, 'User session established')
                } else {
                    logger.info({ component: 'AuthProvider' }, 'No active user session')
                }
            })

            return unsubscribe
        })

        let unsubscribeFn: () => void

        initAuthListener().then((fn) => {
            unsubscribeFn = fn
        }).catch((err) => {
            logger.error({ err, component: 'AuthProvider' }, 'Failed to initialize Auth listener')
            setLoading(false)
        })

        return () => {
            if (unsubscribeFn) unsubscribeFn()
        }
    }, [])

    return (
        <AuthContext.Provider value={{ user, loading }}>
            {children}
        </AuthContext.Provider>
    )
}
