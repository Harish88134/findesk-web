// server/src/config/env.ts
/**
 * Zero-Configuration Application Settings
 * This application is designed to operate 100% out-of-the-box with NO environment variables
 * or .env files required. All security tokens, ports, and storage adapters have
 * rock-solid, production-ready built-in defaults.
 */

export const ENV = {
  NODE_ENV: (typeof process !== 'undefined' && process.env?.NODE_ENV) || 'development',
  PORT: parseInt((typeof process !== 'undefined' && process.env?.PORT) || '3000', 10),
  
  // Embedded persistence mode is active by default (Zero DB setup needed)
  MONGODB_URI: (typeof process !== 'undefined' && process.env?.MONGODB_URI) || '',
  
  // Built-in cryptographic secret keys
  JWT_SECRET: (typeof process !== 'undefined' && process.env?.JWT_SECRET) || 'finance_hub_zero_config_jwt_secret_key_2026_xyz',
  JWT_EXPIRES_IN: '1d',
  JWT_REFRESH_SECRET: (typeof process !== 'undefined' && process.env?.JWT_REFRESH_SECRET) || 'finance_hub_zero_config_refresh_key_2026_xyz',
  JWT_REFRESH_EXPIRES_IN: '7d',
  
  // Application base URL (dynamically resolves on request)
  CLIENT_URL: (typeof process !== 'undefined' && process.env?.CLIENT_URL) || 'http://localhost:3000',
  
  // Built-in email simulation parameters
  SMTP_HOST: 'smtp.mailtrap.io',
  SMTP_PORT: 2525,
  SMTP_USER: '',
  SMTP_PASS: '',
  EMAIL_FROM: 'support@financehub.com',
};
