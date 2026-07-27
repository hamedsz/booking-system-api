export const TOKEN_EXPIRATION = {
  ONE_YEAR: '365d',
  ONE_WEEK: '7d',
  ONE_DAY: '24h',
  THREE_HOURS: '3h',
  FIFTEEN_MINUTES: '15m',
  TEN_MINUTES: '10m',
};

export const TOKEN_LIFESPAN_MILISECOND = {
  TWO_MINUTES: 1000 * 60 * 2,
  FIVE_MINUTES: 1000 * 60 * 5,
  FIFTEEN_MINUTES: 1000 * 60 * 15,
  ONE_DAY: 1000 * 60 * 60 * 24,
  ONE_YEAR: 1000 * 60 * 60 * 24 * 365,
  THREE_HOURS: 1000 * 60 * 60 * 3,
};

export const TOKEN_TYPE = {
  UNVERIFIED: 'unverified_token',
  ACCESS: 'access_token',
  REFRESH: 'refresh_token',
  PASSWORD: 'password_token',
};

export const ROLE = {
  USER: 'user',
  SUPER_ADMIN: 'super_admin',
  CONTENT_MANAGER: 'content_manager',
  CUSTOMER_SERVICE: 'customer_service',
  MARKETING: 'marketing',
};

export const FREE_USAGE_TIME = 60 * 10; // seconds

export const PLAN_NAME = {
  PLUS: 'Plus',
  FREE: 'Free',
};

export const PASSWORD_EXPIRATION = 90;

export const ROLES = {
  ADMIN: 'admin',
  MENTOR: 'mentor',
  USER: 'user',
};
