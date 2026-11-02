import privateAxiosInstance from '../../../auth/privateAxiosInstance';

const SETUP_STEPS = ['supportEmail', 'supportPhone', 'logo', 'welcomeMessage'];

export function buildSetupProgress(school = {}) {
  const steps = {
    supportEmail: Boolean(String(school.supportEmail || '').trim()),
    supportPhone: Boolean(String(school.supportPhone || '').trim()),
    logo: Boolean(school.logoUrl),
    welcomeMessage: Boolean(String(school.welcomeMessage || '').trim()),
  };

  const totalSteps = SETUP_STEPS.length;
  const completedSteps = SETUP_STEPS.filter((step) => steps[step]).length;

  return {
    steps,
    totalSteps,
    completedSteps,
    percentage: Math.round((completedSteps / totalSteps) * 100),
    completed: completedSteps === totalSteps,
  };
}

function normalizeSchool(raw) {
  if (!raw || typeof raw !== 'object') return null;

  return {
    ...raw,
    logoUrl: typeof raw.logoUrl === 'string' ? raw.logoUrl : '',
  };
}

function normalizeProgress(raw, fallback) {
  if (!raw || typeof raw !== 'object') return fallback;

  const completedSteps = Number(raw.completedSteps);
  const totalSteps = Number(raw.totalSteps);
  const percentage = Number(raw.percentage);

  return {
    steps:
      raw.steps && typeof raw.steps === 'object' ? raw.steps : fallback.steps,
    totalSteps: Number.isFinite(totalSteps) ? totalSteps : fallback.totalSteps,
    completedSteps: Number.isFinite(completedSteps)
      ? completedSteps
      : fallback.completedSteps,
    percentage: Number.isFinite(percentage)
      ? percentage
      : fallback.percentage,
    completed:
      typeof raw.completed === 'boolean' ? raw.completed : fallback.completed,
  };
}

export async function getMySchoolProfile() {
  const response = await privateAxiosInstance.get('/schools/my-school');
  const school = normalizeSchool(response?.data?.school);
  const fallbackProgress = buildSetupProgress(school || {});

  return {
    school,
    progress: normalizeProgress(response?.data?.setupProgress, fallbackProgress),
  };
}

export async function updateMySchoolSetup(updates) {
  const response = await privateAxiosInstance.patch(
    '/schools/my-school/setup',
    updates
  );

  return {
    school: normalizeSchool(response?.data?.data),
    message: response?.data?.message || 'School setup updated successfully.',
  };
}

export async function requestSchoolLogoUploadUrl({
  fileName,
  contentType,
  fileSize,
}) {
  const response = await privateAxiosInstance.post(
    '/schools/my-school/logo/upload-url',
    { fileName, contentType, fileSize }
  );

  return response.data;
}

export async function confirmSchoolLogoUpload({ key }) {
  const response = await privateAxiosInstance.patch(
    '/schools/my-school/logo',
    { key }
  );

  return response.data;
}
