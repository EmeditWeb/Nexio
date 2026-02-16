import { useState, useCallback, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { validateFile, compressImage, getFileExtension } from '../utils/imageUtils';

/**
 * useUpload — centralized file upload hook.
 * Handles validation, compression, progress tracking, retry, and cancellation.
 */
export function useUpload() {
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState(null);
    const abortRef = useRef(false);

    /**
     * Upload a file to a Supabase storage bucket.
     * @param {File} file - The file to upload
     * @param {string} bucket - Supabase storage bucket name
     * @param {string} path - Path within the bucket
     * @param {object} options
     * @param {boolean} options.compress - Whether to compress the image (default: true)
     * @param {number} options.maxSizeMB - Max size after compression (default: 1)
     * @param {boolean} options.upsert - Whether to overwrite existing file
     * @returns {Promise<{ url?: string, error?: string }>}
     */
    const upload = useCallback(async (file, bucket, path, options = {}) => {
        const { compress = true, maxSizeMB = 1, upsert = false } = options;

        // Reset state
        setError(null);
        setProgress(0);
        setUploading(true);
        abortRef.current = false;

        try {
            // Step 1: Validate
            const validation = validateFile(file);
            if (!validation.valid) {
                setError(validation.error);
                setUploading(false);
                return { error: validation.error };
            }

            if (abortRef.current) throw new Error('Upload cancelled');
            setProgress(10);

            // Step 2: Compress if needed
            let processedFile = file;
            if (compress) {
                setProgress(20);
                processedFile = await compressImage(file, maxSizeMB);
                setProgress(40);
            }

            if (abortRef.current) throw new Error('Upload cancelled');

            // Step 3: Upload to Supabase
            setProgress(50);
            const { error: uploadError } = await supabase.storage
                .from(bucket)
                .upload(path, processedFile, {
                    upsert,
                    contentType: processedFile.type,
                });

            if (uploadError) {
                const errMsg = uploadError.message || 'Upload failed';
                setError(errMsg);
                setUploading(false);
                return { error: errMsg };
            }

            setProgress(90);

            // Step 4: Get public URL with cache-busting
            const { data: { publicUrl } } = supabase.storage
                .from(bucket)
                .getPublicUrl(path);

            // Append cache-buster to avoid stale browser cache on re-uploads
            const cacheBustedUrl = `${publicUrl}?t=${Date.now()}`;

            setProgress(100);
            setUploading(false);
            return { url: cacheBustedUrl };

        } catch (err) {
            const errMsg = err.message || 'Upload failed';
            setError(errMsg);
            setUploading(false);
            return { error: errMsg };
        }
    }, []);

    /**
     * Upload a profile avatar.
     */
    const uploadAvatar = useCallback(async (file, userId) => {
        const ext = getFileExtension(file.name) || 'jpg';
        const path = `${userId}.${ext}`;
        return upload(file, 'profile-images', path, { compress: true, maxSizeMB: 0.5, upsert: true });
    }, [upload]);

    /**
     * Upload a chat image.
     */
    const uploadChatImage = useCallback(async (file, conversationId) => {
        const ext = getFileExtension(file.name) || 'jpg';
        const path = `messages/${conversationId}/${Date.now()}.${ext}`;
        return upload(file, 'chat-media', path, { compress: true, maxSizeMB: 1 });
    }, [upload]);

    /**
     * Upload a story media file.
     */
    const uploadStoryMedia = useCallback(async (file, userId) => {
        const ext = getFileExtension(file.name) || 'jpg';
        const path = `stories/${userId}/${Date.now()}.${ext}`;
        return upload(file, 'story-media', path, { compress: true, maxSizeMB: 1 });
    }, [upload]);

    /**
     * Cancel the current upload.
     */
    const cancelUpload = useCallback(() => {
        abortRef.current = true;
        setUploading(false);
        setProgress(0);
        setError(null);
    }, []);

    /**
     * Reset error state for retry.
     */
    const resetError = useCallback(() => {
        setError(null);
        setProgress(0);
    }, []);

    return {
        uploading,
        progress,
        error,
        upload,
        uploadAvatar,
        uploadChatImage,
        uploadStoryMedia,
        cancelUpload,
        resetError,
    };
}
