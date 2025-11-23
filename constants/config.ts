// ============================================
// App Configuration
// ============================================

// API Configuration
export const API_CONFIG = {
  // Thay đổi URL này thành URL backend của bạn
  BASE_URL: process.env.EXPO_PUBLIC_API_URL || 'http://192.168.30.208:3000',
  TIMEOUT: 30000,
};

// Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: '@vocabio/auth_token',
  REFRESH_TOKEN: '@vocabio/refresh_token',
  USER_DATA: '@vocabio/user_data',
  ACCESS_EXPIRE_AT: '@vocabio/access_expire_at',
  REFRESH_EXPIRE_AT: '@vocabio/refresh_expire_at',
  THEME: '@vocabio/theme',
  SETTINGS: '@vocabio/settings',
};

// SRS Configuration
export const SRS_CONFIG = {
  INITIAL_EASINESS: 2.5,
  MIN_EASINESS: 1.3,
  QUALITY_WEIGHTS: {
    0: -0.8, // Completely forgot
    1: -0.54, // Incorrect, but remembered
    2: -0.32, // Incorrect, but easy to recall
    3: 0, // Correct, but with difficulty
    4: 0.14, // Correct, but with hesitation
    5: 0.22, // Perfect recall
  },
};

// Quiz Configuration
export const QUIZ_CONFIG = {
  SPEED_TEST_DURATION: 60, // seconds
  DEFAULT_QUESTION_COUNT: 10,
};

// App Settings
export const APP_CONFIG = {
  SUPPORTED_LANGUAGES: ['vi', 'en'],
  DEFAULT_LANGUAGE: 'vi',
};

