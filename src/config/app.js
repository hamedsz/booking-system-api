export const PORT = process.env.APP_PORT || 3000;
export const NODE_ENV = process.env.NODE_ENV || 'production';
export const IS_DEBUG = process.env.IS_DEBUG === 'true';
export const ENV_BACKEND_HOST = process.env.BACKEND_HOST || 'http://localhost:3000';

export const JWT_SECRET_USER_MODEL = process.env.JWT_SECRET;
export const JWT_SECRET_ADMIN_MODEL = process.env.JWT_SECRET_ADMIN || process.env.JWT_SECRET;

export const { WEB_APP_URL } = process.env;

// Parse comma-separated CORS domains from env or fallback to WEB_APP_URL
export const CORS_ALLOWED_DOMAINS = process.env.CORS_ALLOWED_DOMAINS
  ? process.env.CORS_ALLOWED_DOMAINS.split(',').map((domain) => domain.trim())
  : [WEB_APP_URL];
