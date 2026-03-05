import { describe, it, expect, vi, beforeEach } from 'vitest'
import { compressImage } from '@/lib/utils/image-compression'

// Mock logger heavily used by compression logic
vi.mock('@/lib/logger', () => ({
    default: { info: vi.fn(), error: vi.fn() }
}))

describe('Media Compression Engine (SPR-004)', () => {

    beforeEach(() => {
        vi.clearAllMocks()

        // Partially mock global file reading capabilities which JSDom lacks
        global.FileReader = class {
            onload: any;
            onerror: any;
            readAsDataURL() {
                setTimeout(() => {
                    this.onload({ target: { result: 'data:image/jpeg;base64,mock' } });
                }, 10)
            }
        } as any

        global.Image = class {
            onload: any;
            onerror: any;
            width = 2000;
            height = 2000;
            set src(_val: string) {
                setTimeout(() => this.onload(), 10)
            }
        } as any

        HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
            drawImage: vi.fn(),
        })) as any

        HTMLCanvasElement.prototype.toBlob = vi.fn(function (this: any, cb) {
            setTimeout(() => cb(new Blob(['mock_compressed_data'])), 10)
        }) as any
    })

    it('rejects non-image payload formats upfront', async () => {
        const fakePDF = new File(['%PDF-1.4'], 'lease.pdf', { type: 'application/pdf' })
        await expect(compressImage(fakePDF)).rejects.toThrow('Provided file is not an image.')
    })

    it('bypasses calculation logic if file is already a micro-payload', async () => {
        const microImg = new File(['tiny_data'], 'avatar.jpg', { type: 'image/jpeg' })
        const result = await compressImage(microImg)
        expect(result).toBe(microImg)
    })

    it('compresses high-res inputs by pushing them through the Canvas scaling context', async () => {
        const rawData = '0'.repeat(1024 * 600)
        const hdImage = new File([rawData], 'huge_photo.png', { type: 'image/png' })

        const result = await compressImage(hdImage, { maxWidth: 1080 })
        expect(result.name).toBe('huge_photo.jpg')
        expect(result.type).toBe('image/jpeg')
        expect(HTMLCanvasElement.prototype.getContext).toHaveBeenCalledWith('2d')
    })

    it('scales by maxHeight when the vertical axis exceeds limits more than width', async () => {
        const rawData = '0'.repeat(1024 * 600)
        const tallImage = new File([rawData], 'tall_photo.png', { type: 'image/png' })
        // Force the second if() block by providing a giant width but restrictive height
        await compressImage(tallImage, { maxWidth: 3000, maxHeight: 500 })
        expect(HTMLCanvasElement.prototype.getContext).toHaveBeenCalledWith('2d')
    })

    it('throws an ApplicationError if the Canvas 2D engine is unavailable', async () => {
        const rawData = '0'.repeat(1024 * 600)
        const hdImage = new File([rawData], 'huge_photo.png', { type: 'image/png' })

        HTMLCanvasElement.prototype.getContext = vi.fn(() => null) as any

        await expect(compressImage(hdImage)).rejects.toThrow('Canvas 2D context not supported on this device.')
    })

    it('throws an ApplicationError if the Blob serialization engine fails', async () => {
        const rawData = '0'.repeat(1024 * 600)
        const hdImage = new File([rawData], 'huge_photo.png', { type: 'image/png' })

        HTMLCanvasElement.prototype.toBlob = vi.fn(function (this: any, cb) {
            setTimeout(() => cb(null), 10)
        }) as any

        await expect(compressImage(hdImage)).rejects.toThrow('Failed to serialize image payload.')
    })

    it('throws an ApplicationError if the Image object fails to load the data URI', async () => {
        const rawData = '0'.repeat(1024 * 600)
        const hdImage = new File([rawData], 'huge_photo.png', { type: 'image/png' })

        global.Image = class {
            onload: any;
            onerror: any;
            set src(_val: string) {
                setTimeout(() => this.onerror(), 10)
            }
        } as any

        await expect(compressImage(hdImage)).rejects.toThrow('Corrupted media file provided.')
    })

    it('throws an ApplicationError if the FileReader memory buffer crashes', async () => {
        const rawData = '0'.repeat(1024 * 600)
        const hdImage = new File([rawData], 'huge_photo.png', { type: 'image/png' })

        global.FileReader = class {
            onload: any;
            onerror: any;
            readAsDataURL() {
                setTimeout(() => this.onerror(), 10)
            }
        } as any

        await expect(compressImage(hdImage)).rejects.toThrow('Failed to read media into browser memory.')
    })
})
