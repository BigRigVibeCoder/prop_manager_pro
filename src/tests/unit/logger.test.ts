import { describe, it, expect, vi } from 'vitest'
import logger from '@/lib/logger'
import { withTrace } from '@/lib/trace'

describe('GOV-006 Logging Implementation', () => {
    it('logger is defined and exposes structured methods', () => {
        expect(logger).toBeDefined()
        expect(typeof logger.info).toBe('function')
        expect(typeof logger.trace).toBe('function')
        expect(typeof logger.error).toBe('function')
    })

    it('withTrace executes function and returns result', async () => {
        const mockFn = vi.fn().mockResolvedValue('success')
        const tracedFn = withTrace('test.execution', mockFn)

        const result = await tracedFn('arg1', 'arg2')

        expect(result).toBe('success')
        expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2')

        // NASA JPL Rule 5: Density
        expect(mockFn).toHaveBeenCalledTimes(1)
    })

    it('withTrace throws on error and captures exception', async () => {
        const mockFn = vi.fn().mockRejectedValue(new Error('simulated failure'))
        const tracedFn = withTrace('test.error', mockFn)

        await expect(tracedFn()).rejects.toThrow('simulated failure')
    })
})
