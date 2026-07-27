export const { SENTRY_DSN } = process.env;

export const IGNORE_ERRORS = [
  'Page not found',
  'Credential token is needeed.',
  'Token expired',
  'Invalid Authorization header',
  'Token might be expired or invalid.',
  'Invalid email or password.',
];
