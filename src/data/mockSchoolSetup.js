export const setupStorageKey = 'scholanode-school-setup';

export const defaultSchoolSetup = {
  schoolName: 'FUD International School',
  schoolCode: 'FUD-INTL',
  email: 'info@fudinternational.edu.ng',
  phoneNumber: '+234 703 123 4567',
  address: 'P.M.B 7156, Dutse, Jigawa State, Nigeria',
  logoUrl: '',
  welcomeMessage: '',
  loginInstructions: '',
  registrationGuidelines: '',
  supportEmail: 'support@fudinternational.edu.ng',
  supportPhone: '+234 703 123 4567',
};

export const setupItems = [
  {
    key: 'logoUrl',
    title: 'Add your school logo',
    description: 'Give your portal a recognisable school identity.',
  },
  {
    key: 'welcomeMessage',
    title: 'Write a welcome message',
    description: 'Make the first portal visit feel personal.',
  },
  {
    key: 'loginInstructions',
    title: 'Add login instructions',
    description: 'Help students, parents and staff sign in smoothly.',
  },
  {
    key: 'registrationGuidelines',
    title: 'Add registration guidelines',
    description: 'Set clear expectations for new school users.',
  },
  {
    key: 'supportDetails',
    title: 'Confirm support contacts',
    description: 'Tell families where to get help when they need it.',
  },
];

export function getSetupCompletion(school) {
  const completedKeys = setupItems.filter((item) => {
    if (item.key === 'supportDetails') {
      return school.supportEmail && school.supportPhone;
    }
    return Boolean(school[item.key]);
  });

  return Math.round((completedKeys.length / setupItems.length) * 100);
}

export function loadSchoolSetup() {
  if (typeof window === 'undefined') return defaultSchoolSetup;

  try {
    const saved = window.localStorage.getItem(setupStorageKey);
    return saved
      ? { ...defaultSchoolSetup, ...JSON.parse(saved) }
      : defaultSchoolSetup;
  } catch {
    return defaultSchoolSetup;
  }
}

export function saveSchoolSetup(school) {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(setupStorageKey, JSON.stringify(school));
  }
}
