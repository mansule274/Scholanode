import axios from 'axios';

import { getFileExtension } from '../../utils/media/validateMedia';

export const MEDIA_UPLOAD_STAGES = Object.freeze({
  PREPARING: 'preparing',
  REQUESTING_URL: 'requesting-url',
  UPLOADING: 'uploading',
  CONFIRMING: 'confirming',
  COMPLETED: 'completed',
});

export class MediaUploadError extends Error {
  constructor(message, { phase, key = '', cause } = {}) {
    super(message);
    this.name = 'MediaUploadError';
    this.phase = phase;
    this.key = key;
    this.cause = cause;
  }
}

// Dedicated client for the signed storage URL. It has no ScholaNode interceptors,
// so the backend Authorization header is never sent to Cloudflare R2.
const storageClient = axios.create({
  timeout: 0,
  withCredentials: false,
});

const MIME_EXTENSION = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

function normalizeFileName(fileName, contentType) {
  const rawName = String(fileName || '').trim();
  const extension =
    getFileExtension(rawName) || MIME_EXTENSION[contentType] || 'file';
  const baseName = rawName
    .replace(/\.[^./\\]+$/, '')
    .replace(/[^a-zA-Z0-9 _.-]+/g, '-')
    .replace(/\s+/g, ' ')
    .replace(/^[-.\s]+|[-.\s]+$/g, '')
    .slice(0, 180)
    .trim();

  return `${baseName || 'upload'}.${extension}`;
}

function getServerMessage(error) {
  const status = error?.response?.status;

  // Server faults are shown through the generic friendly fallback instead of
  // surfacing internal details.
  if (!status || status >= 500) return '';

  const data = error.response.data;

  if (typeof data?.message === 'string' && data.message.trim()) {
    return data.message.trim();
  }

  if (typeof data?.error === 'string' && data.error.trim()) {
    return data.error.trim();
  }

  return '';
}

function describeStorageError(error) {
  if (error?.code === 'ERR_CANCELED') {
    return 'The upload was cancelled.';
  }

  if (!error?.response) {
    return 'The upload was interrupted. Check your connection and try again.';
  }

  const { status } = error.response;

  if (status === 400 || status === 403) {
    return 'The secure upload link expired before the upload finished. Please try again.';
  }

  if (status === 404) {
    return 'The secure upload link is no longer available. Please try again.';
  }

  if (status === 413) {
    return 'This image is too large to upload. Please choose a smaller image.';
  }

  if (status >= 500) {
    return 'Secure storage is unavailable right now. Please try again in a moment.';
  }

  return 'We could not upload your image. Please try again.';
}

function getMimeType(file, contentType) {
  const mimeType = String(contentType || file?.type || '')
    .trim()
    .toLowerCase();

  return mimeType;
}

export async function uploadMedia({
  file,
  requestUploadUrl,
  confirmUpload,
  contentType,
  onStage = () => {},
  onProgress = () => {},
} = {}) {
  if (!file) {
    throw new MediaUploadError('Choose a file to upload.', {
      phase: MEDIA_UPLOAD_STAGES.PREPARING,
    });
  }

  if (typeof requestUploadUrl !== 'function' || typeof confirmUpload !== 'function') {
    throw new MediaUploadError(
      'Uploads are not available right now. Please try again later.',
      { phase: MEDIA_UPLOAD_STAGES.PREPARING },
    );
  }

  const mimeType = getMimeType(file, contentType);

  if (!mimeType) {
    throw new MediaUploadError(
      'We could not determine this file type. Please choose another file.',
      { phase: MEDIA_UPLOAD_STAGES.PREPARING },
    );
  }

  onStage(MEDIA_UPLOAD_STAGES.REQUESTING_URL);

  let response;

  try {
    response = await requestUploadUrl({
      fileName: normalizeFileName(file.name, mimeType),
      contentType: mimeType,
      fileSize: file.size,
    });
  } catch (error) {
    throw new MediaUploadError(
      getServerMessage(error) ||
        'We could not start the upload. Check your connection and try again.',
      { phase: MEDIA_UPLOAD_STAGES.REQUESTING_URL, cause: error },
    );
  }

  if (response?.success === false) {
    throw new MediaUploadError(
      typeof response?.message === 'string' && response.message.trim()
        ? response.message.trim()
        : 'We could not start the upload. Please try again.',
      { phase: MEDIA_UPLOAD_STAGES.REQUESTING_URL },
    );
  }

  const uploadUrl = response?.uploadUrl;
  const key = response?.key;

  if (
    typeof uploadUrl !== 'string' ||
    !uploadUrl ||
    typeof key !== 'string' ||
    !key
  ) {
    throw new MediaUploadError(
      'We received an unexpected upload response. Please try again.',
      { phase: MEDIA_UPLOAD_STAGES.REQUESTING_URL },
    );
  }

  onStage(MEDIA_UPLOAD_STAGES.UPLOADING);
  onProgress(0);

  console.log('[r2] Starting direct upload', {
    fileName: file.name,
    contentType: mimeType,
    size: file.size,
  });

  try {
    const response = await storageClient.put(uploadUrl, file, {
      headers: { 'Content-Type': mimeType },
      onUploadProgress: (event) => {
        const total = Number(event?.total) || 0;
        const loaded = Number(event?.loaded) || 0;

        if (total > 0) {
          onProgress(
            Math.min(100, Math.max(0, Math.round((loaded / total) * 100))),
          );
        } else {
          // The browser could not report a total, so the UI shows an
          // indeterminate indicator instead of a fabricated percentage.
          onProgress(null);
        }
      },
    });

    console.log('[r2] Direct upload response', {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    });

    onProgress(100);
  } catch (error) {
    console.error('[r2] Direct upload error', {
      status: error?.response?.status,
      statusText: error?.response?.statusText,
      data: error?.response?.data,
      code: error?.code,
      message: error?.message,
    });

    throw new MediaUploadError(describeStorageError(error), {
      phase: MEDIA_UPLOAD_STAGES.UPLOADING,
      key,
      cause: error,
    });
  }

  return confirmMediaUpload({ key, confirmUpload, onStage });
}

export async function confirmMediaUpload({
  key,
  confirmUpload,
  onStage = () => {},
}) {
  if (!key) {
    throw new MediaUploadError(
      'We do not have an uploaded file to confirm. Please choose your file again.',
      { phase: MEDIA_UPLOAD_STAGES.CONFIRMING },
    );
  }

  if (typeof confirmUpload !== 'function') {
    throw new MediaUploadError(
      'Uploads are not available right now. Please try again later.',
      { phase: MEDIA_UPLOAD_STAGES.CONFIRMING, key },
    );
  }

  onStage(MEDIA_UPLOAD_STAGES.CONFIRMING);

  let confirmation;

  try {
    confirmation = await confirmUpload({ key });
  } catch (error) {
    throw new MediaUploadError(
      getServerMessage(error) ||
        'Your file uploaded, but we could not save it to your account. Please try again.',
      { phase: MEDIA_UPLOAD_STAGES.CONFIRMING, key, cause: error },
    );
  }

  if (confirmation?.success === false) {
    throw new MediaUploadError(
      typeof confirmation?.message === 'string' && confirmation.message.trim()
        ? confirmation.message.trim()
        : 'The upload could not be confirmed. Please try again.',
      { phase: MEDIA_UPLOAD_STAGES.CONFIRMING, key },
    );
  }

  onStage(MEDIA_UPLOAD_STAGES.COMPLETED);

  return { key, confirmation };
}
