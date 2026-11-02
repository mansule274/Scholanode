import imageCompression from 'browser-image-compression';

export const COMPRESSION_PRESETS = Object.freeze({
  PROFILE_IMAGE: Object.freeze({ maxSizeMB: 0.5, maxWidthOrHeight: 800 }),
  SCHOOL_LOGO: Object.freeze({ maxSizeMB: 0.5, maxWidthOrHeight: 1000 }),
  SUPPORT_SCREENSHOT: Object.freeze({ maxSizeMB: 1, maxWidthOrHeight: 1600 }),
  GENERAL_IMAGE: Object.freeze({ maxSizeMB: 1, maxWidthOrHeight: 1600 }),
});

const COMPRESSIBLE_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
]);

async function runCompression(file, options) {
  try {
    return await imageCompression(file, { ...options, useWebWorker: true });
  } catch {
    // Some browsers or strict CSP setups block blob workers.
    return imageCompression(file, { ...options, useWebWorker: false });
  }
}

export async function compressImage(file, preset = COMPRESSION_PRESETS.GENERAL_IMAGE) {
  if (!file) return file;

  const mimeType = String(file.type || '').toLowerCase();

  // PDFs, audio, video and unsupported images are never compressed here.
  if (!COMPRESSIBLE_MIME_TYPES.has(mimeType)) return file;

  const settings =
    typeof preset === 'string' ? COMPRESSION_PRESETS[preset] : preset;

  if (!settings) {
    throw new Error('Unknown image compression preset.');
  }

  console.log('[media] Compression started', {
    fileName: file.name,
    mimeType,
    originalSize: file.size,
    targetMaxSizeMB: settings.maxSizeMB,
    targetMaxWidthOrHeight: settings.maxWidthOrHeight,
  });

  const startedAt = performance.now();

  try {
    const compressed = await runCompression(file, {
      maxSizeMB: settings.maxSizeMB,
      maxWidthOrHeight: settings.maxWidthOrHeight,
      fileType: mimeType,
      maxIteration: 8,
    });

    if (!compressed || compressed.size >= file.size) {
      console.log('[media] Compression skipped: original is already smaller', {
        fileName: file.name,
        originalSize: file.size,
        compressedSize: compressed?.size ?? 0,
      });

      return file;
    }

    const reductionPercent =
      ((file.size - compressed.size) / file.size) * 100;

    console.log('[media] Compression completed', {
      fileName: compressed.name,
      mimeType: compressed.type,
      originalSize: file.size,
      compressedSize: compressed.size,
      reductionPercent: Number(reductionPercent.toFixed(1)),
      durationMs: Math.round(performance.now() - startedAt),
    });

    return compressed;
  } catch (error) {
    console.error('[media] Compression failed', {
      fileName: file.name,
      originalSize: file.size,
      durationMs: Math.round(performance.now() - startedAt),
      message: error?.message,
      error,
    });

    const compressionError = new Error(
      'We could not prepare that image. Please try a different photo.',
    );
    compressionError.name = 'ImageCompressionError';
    compressionError.cause = error;
    throw compressionError;
  }
}
