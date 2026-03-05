import { collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, query, where, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import type { Property } from '@/lib/models/types'
import { withTrace } from '@/lib/trace'
import { ApplicationError } from '@/lib/errors/ApplicationError'
import { ErrorCategory } from '@/lib/errors/types'

const COLLECTION = 'properties'

/**
 * Helper to ensure standard NoSQL dates
 */
const getNow = () => serverTimestamp()

/**
 * Fetches a single property by ID
 */
export const getProperty = withTrace('api.properties.get', async (id: string): Promise<Property> => {
    const docRef = doc(db, COLLECTION, id)
    const docSnap = await getDoc(docRef)

    if (!docSnap.exists()) {
        throw new ApplicationError(`Property ${id} not found`, {
            category: ErrorCategory.RESOURCE,
            component: 'PropertyAPI',
        })
    }

    return { id: docSnap.id, ...docSnap.data() } as Property
})

/**
 * Lists all properties securely filtered by ownerId
 */
export const listPropertiesByOwner = withTrace(
    'api.properties.listByOwner',
    async (ownerId: string): Promise<Property[]> => {
        const q = query(collection(db, COLLECTION), where('ownerId', '==', ownerId))
        const querySnapshot = await getDocs(q)

        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as Property[]
    }
)

/**
 * Creates a new property document
 */
export const createProperty = withTrace(
    'api.properties.create',
    async (propertyId: string, data: Omit<Property, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> => {
        const docRef = doc(db, COLLECTION, propertyId)

        await setDoc(docRef, {
            ...data,
            createdAt: getNow(),
            updatedAt: getNow(),
        })
    }
)

/**
 * Updates an existing property document
 */
export const updateProperty = withTrace(
    'api.properties.update',
    async (id: string, data: Partial<Omit<Property, 'id' | 'ownerId' | 'createdAt'>>): Promise<void> => {
        const docRef = doc(db, COLLECTION, id)

        await updateDoc(docRef, {
            ...data,
            updatedAt: getNow(),
        })
    }
)

/**
 * Deletes a property document
 */
export const deleteProperty = withTrace(
    'api.properties.delete',
    async (id: string): Promise<void> => {
        const docRef = doc(db, COLLECTION, id)
        await deleteDoc(docRef)
    }
)
