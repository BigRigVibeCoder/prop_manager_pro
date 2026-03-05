import { ErrorCategory } from '@/lib/errors/types';
import { ApplicationError } from '@/lib/errors/ApplicationError';
import logger from '@/lib/logger';

interface CompressionOptions {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number; // 0 to 1
    maxSizeKB?: number;
}

/**
 * Enterprise Compression Utility (Sprint 4 / Task 9)
 * 
 * Intercepts tenant maintenance photos or property images before GCP Cloud Storage upload.
 * Utilizes the native HTML5 Canvas API to perform hardware-accelerated downscaling without 
 * inflating the Next.js bundle footprint with 3rd-party dependencies.
 */
export async function compressImage(
    file: File,
    options: CompressionOptions = {}
): Promise<File> {
    const {
        maxWidth = 1920,
        maxHeight = 1080,
        quality = 0.8,
        maxSizeKB = 500
    } = options;

    // GOV-003 Defensive Coding
    if (!file.type.startsWith('image/')) {
        throw new ApplicationError(
            'Provided file is not an image.',
            { errorId: 'compression_invalid_type', category: ErrorCategory.VALIDATION }
        );
    }

    // Pre-flight check: If it's already tiny and under the threshold, bypass CPU heavy canvas rendering
    if (file.size / 1024 < maxSizeKB) {
        logger.info({ fileName: file.name, originalSize: file.size }, 'Image already under threshold. Bypassing compression.');
        return file;
    }

    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;

            img.onload = () => {
                // Calculate new intrinsic bounds matching 16:9 or custom rules
                let targetWidth = img.width;
                let targetHeight = img.height;

                if (targetWidth > maxWidth) {
                    targetHeight = (maxWidth / targetWidth) * targetHeight;
                    targetWidth = maxWidth;
                }

                if (targetHeight > maxHeight) {
                    targetWidth = (maxHeight / targetHeight) * targetWidth;
                    targetHeight = maxHeight;
                }

                // Draw offscreen
                const canvas = document.createElement('canvas');
                canvas.width = targetWidth;
                canvas.height = targetHeight;
                const ctx = canvas.getContext('2d');

                if (!ctx) {
                    return reject(new ApplicationError('Canvas 2D context not supported on this device.', { errorId: 'compression_engine_failure', category: ErrorCategory.SYSTEM }));
                }

                ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

                // Convert the rendered context back to a binary Blob (JPEG for high compression returns)
                canvas.toBlob((blob) => {
                    if (!blob) {
                        return reject(new ApplicationError('Failed to serialize image payload.', { errorId: 'compression_blob_failure', category: ErrorCategory.SYSTEM }));
                    }

                    const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, ".jpg"), {
                        type: 'image/jpeg',
                        lastModified: Date.now(),
                    });

                    // GOV-006 Telemetry verification
                    logger.info({
                        original: `${(file.size / 1024).toFixed(2)} KB`,
                        compressed: `${(compressedFile.size / 1024).toFixed(2)} KB`
                    }, 'Successfully executed image compression pipeline');

                    resolve(compressedFile);
                }, 'image/jpeg', quality);
            };

            img.onerror = () => reject(new ApplicationError('Corrupted media file provided.', { errorId: 'compression_load_failure', category: ErrorCategory.VALIDATION }));
        };

        reader.onerror = () => reject(new ApplicationError('Failed to read media into browser memory.', { errorId: 'compression_read_failure', category: ErrorCategory.SYSTEM }));
    });
}
