import { initializeApp, getApps, getApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import { getStorage } from 'firebase/storage'
import logger from '@/lib/logger'

// Firebase Configuration extracted from Environment Variables
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Singleton pattern to prevent re-initialization during Next.js Hot Reloads
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp()

// Export standard instances
export const db = getFirestore(app)
export const auth = getAuth(app)
export const storage = getStorage(app)

// GOV-006 Context Logging
logger.info({ projectId: firebaseConfig.projectId, component: 'Firebase SDK' }, 'firebase.initialized')
