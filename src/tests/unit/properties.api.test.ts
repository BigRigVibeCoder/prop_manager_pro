import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getProperty, createProperty, updateProperty, deleteProperty, listPropertiesByOwner } from '@/lib/api/properties'
import { ApplicationError } from '@/lib/errors/ApplicationError'

// Mock Firebase APIs to prevent local NoSQL network calls during unit testing
vi.mock('firebase/firestore', () => {
    return {
        getFirestore: vi.fn(),
        collection: vi.fn(),
        doc: vi.fn(),
        getDoc: vi.fn(),
        getDocs: vi.fn(),
        setDoc: vi.fn(),
        updateDoc: vi.fn(),
        deleteDoc: vi.fn(),
        query: vi.fn(),
        where: vi.fn(),
        serverTimestamp: vi.fn(() => ({ seconds: 123456, nanoseconds: 0 }))
    }
})

// Mock the Logger/Tracer so it doesn't fail on undefined Next configs
vi.mock('@/lib/logger', () => ({
    default: { info: vi.fn(), trace: vi.fn(), error: vi.fn(), fatal: vi.fn() }
}))
vi.mock('@/lib/firebase/config', () => ({ db: {} }))

// Import the mocked firestore functions for assertions
import { getDoc, setDoc, updateDoc, deleteDoc, getDocs } from 'firebase/firestore'

describe('Property API Layer (BLU-002)', () => {

    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('getProperty fetches and formats correctly', async () => {
        const mockSnap = {
            exists: () => true,
            id: 'prop_123',
            data: () => ({ name: 'Sunrise Apartments' })
        }
        vi.mocked(getDoc).mockResolvedValue(mockSnap as any)

        const prop = await getProperty('prop_123')
        expect(prop.id).toBe('prop_123')
        expect(prop.name).toBe('Sunrise Apartments')
        expect(getDoc).toHaveBeenCalledTimes(1)
    })

    it('getProperty throws ApplicationError on miss to trigger GOV-004 handlers', async () => {
        const mockSnap = { exists: () => false }
        vi.mocked(getDoc).mockResolvedValue(mockSnap as any)

        await expect(getProperty('missing_prop')).rejects.toThrow(ApplicationError)
        await expect(getProperty('missing_prop')).rejects.toThrow('Property missing_prop not found')
    })

    it('createProperty attaches server timestamps', async () => {
        await createProperty('new_id', {
            name: 'Oceanside',
            ownerId: 'owner_1',
            address: { street: '123', city: 'A', state: 'A', zipCode: 'A', country: 'US' },
            specs: { units: 10, squareFeet: 5000 },
            status: 'active'
        })

        expect(setDoc).toHaveBeenCalledTimes(1)
        const payloadInfo = vi.mocked(setDoc).mock.calls[0][1]

        // Assert interceptor automatically timestamped the NoSQL record
        expect(payloadInfo).toHaveProperty('createdAt')
        expect(payloadInfo.createdAt).toHaveProperty('seconds')
    })

    it('updateProperty attaches only updatedAt server timestamp', async () => {
        await updateProperty('update_id', { name: 'Renamed' })

        expect(updateDoc).toHaveBeenCalledTimes(1)
        const payloadInfo = vi.mocked(updateDoc).mock.calls[0][1]

        expect(payloadInfo).toHaveProperty('updatedAt')
        expect(payloadInfo).not.toHaveProperty('createdAt') // Shouldn't clobber creation
    })

    it('listProperties constructs basic query and marshals the document set', async () => {
        const mockDocs = [
            { id: '1', data: () => ({ name: 'A' }) },
            { id: '2', data: () => ({ name: 'B' }) }
        ]
        vi.mocked(getDocs).mockResolvedValue({ docs: mockDocs } as any)

        const results = await listPropertiesByOwner('user_111')
        expect(results.length).toBe(2)
        expect(results[0].id).toBe('1')
    })

    it('deleteProperty calls standard Firestore delete API', async () => {
        await deleteProperty('prop_delete')
        expect(deleteDoc).toHaveBeenCalledTimes(1)
    })
})
