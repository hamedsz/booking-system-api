export const EMAIL_CONFIG = {
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  testMode: process.env.TEST_MAIL === 'true',
};

export default EMAIL_CONFIG;
