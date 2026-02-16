// ═══════════════════════════════════════════════════════════
// Nexio — Image Utilities
// Validation, compression, and file helpers.
// ═══════════════════════════════════════════════════════════

import imageCompression from 'browser-image-compression';
import { MAX_FILE_SIZE_BYTES, MAX_FILE_SIZE_MB, ALLOWED_IMAGE_TYPES, ALLOWED_EXTENSIONS } from './constants';

/**
 * Validate a file for upload.
 * @param {File} file
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateFile(file) {
    if (!file) return { valid: false, error: 'No file selected' };

    // Check MIME type
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        return {
            valid: false,
            error: `Unsupported file type. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}`,
        };
    }

    // Check extension as secondary validation
    const ext = getFileExtension(file.name);
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
        return {
            valid: false,
            error: `Unsupported file extension. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}`,
        };
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE_BYTES) {
        return {
            valid: false,
            error: `File too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Maximum size is ${MAX_FILE_SIZE_MB}MB.`,
        };
    }

    return { valid: true };
}

/**
 * Compress an image if it exceeds maxSizeMB.
 * Returns the original file if it's already small enough.
 * @param {File} file
 * @param {number} maxSizeMB - target max size in MB (default: 1MB)
 * @returns {Promise<File>}
 */
export async function compressImage(file, maxSizeMB = 1) {
    // Skip compression for GIFs (would lose animation)
    if (file.type === 'image/gif') return file;

    // If already under target, skip
    if (file.size <= maxSizeMB * 1024 * 1024) return file;

    try {
        const options = {
            maxSizeMB,
            maxWidthOrHeight: 1920,
            useWebWorker: true,
            fileType: file.type === 'image/png' ? 'image/png' : 'image/jpeg',
        };

        const compressed = await imageCompression(file, options);
        return compressed;
    } catch (err) {
        console.warn('Image compression failed, using original:', err);
        return file;
    }
}

/**
 * Get file extension from filename (lowercase).
 * @param {string} filename
 * @returns {string}
 */
export function getFileExtension(filename) {
    if (!filename) return '';
    const parts = filename.split('.');
    return parts.length > 1 ? parts.pop().toLowerCase() : '';
}

/**
 * Create an object URL for previewing a file.
 * Remember to revoke with URL.revokeObjectURL when done.
 * @param {File} file
 * @returns {string}
 */
export function createPreviewUrl(file) {
    return URL.createObjectURL(file);
}
