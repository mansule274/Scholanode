const DEFAULT_MAX_SIZE_BYTES = 5 * 1024 * 1024;

export const PROFILE_IMAGE_MEDIA_RULES = Object.freeze({
  allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
  allowedExtensions: ['jpg', 'jpeg', 'png', 'webp'],
  maxSizeBytes: DEFAULT_MAX_SIZE_BYTES,
  typeLabel: 'JPG, PNG or WebP image',
});

export function formatFileSize(bytes) {
  const size = Number(bytes);

  if (!Number.isFinite(size) || size <= 0) return '0 KB';
  if (size < 1024 * 1024) return `${Math.max(1, Math.round(size / 1024))} KB`;

  const sizeInMb = size / (1024 * 1024);
  const rounded = sizeInMb >= 10 ? sizeInMb.toFixed(0) : sizeInMb.toFixed(1);

  return `${rounded.replace(/\.0$/, '')} MB`;
}

export function getFileExtension(fileName = '') {
  const match = String(fileName).trim().toLowerCase().match(/\.([a-z0-9]+)$/);
  return match ? match[1] : '';
}

export function validateMediaFile(file, rules = PROFILE_IMAGE_MEDIA_RULES) {
  const {
    allowedMimeTypes = [],
    allowedExtensions = null,
    maxSizeBytes = DEFAULT_MAX_SIZE_BYTES,
    typeLabel = 'supported file',
  } = rules || {};

  if (!file) {
    return { valid: false, message: 'Choose a file to upload.' };
  }

  if (!file.size) {
    return {
      valid: false,
      message: 'That file looks empty. Please choose a different one.',
    };
  }

  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      message: `That file is ${formatFileSize(file.size)}. The maximum allowed size is ${formatFileSize(maxSizeBytes)}.`,
    };
  }

  const mimeType = String(file.type || '').toLowerCase();

  if (allowedMimeTypes.length && !allowedMimeTypes.includes(mimeType)) {
    return {
      valid: false,
      message: `That file type is not supported. Choose a ${typeLabel}.`,
    };
  }

  if (allowedExtensions?.length) {
    const extension = getFileExtension(file.name);

    if (!extension || !allowedExtensions.includes(extension)) {
      const extensions = allowedExtensions
        .map((item) => `.${item}`)
        .join(', ');

      return {
        valid: false,
        message: `Choose a file with one of these extensions: ${extensions}.`,
      };
    }
  }

  return { valid: true, message: '' };
}
