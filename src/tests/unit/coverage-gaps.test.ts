import { describe, it, expect } from 'vitest'
import { ApplicationError } from '@/lib/errors/ApplicationError'
import { withTrace } from '@/lib/trace'

describe('Coverage Gap Fillers', () => {

    // Refs: GOV-002
    it('ApplicationError generates JSON without a cause', () => {
        // Tests hit line 36 of ApplicationError.ts (cause: undefined)
        const err = new ApplicationError('No cause error')
        const json = err.toJSON()
        expect(json.cause).toBeUndefined()
    })

    it('withTrace handles thrown strings (not instances of Error)', async () => {
        // Tests hit line 26 of trace.ts (String(error) fallback)
        const mockFn = () => Promise.reject('String failure')
        const tracedFn = withTrace('test.string.throw', mockFn)

        await expect(tracedFn()).rejects.toBe('String failure')
    })
})
