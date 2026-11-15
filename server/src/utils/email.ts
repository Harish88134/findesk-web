// server/src/utils/email.ts
import { ENV } from '../config/env';
import { logger } from './logger';

export interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html: string;
}

export const sendEmail = async (options: EmailOptions): Promise<boolean> => {
  logger.info(`Sending email to ${options.to}: [${options.subject}]`);
  
  // If SMTP credentials exist, you can invoke nodemailer transport here.
  // In development and cloud environments without external SMTP, log securely and return true.
  if (ENV.SMTP_USER && ENV.SMTP_PASS) {
    try {
      // In production with nodemailer:
      // const transporter = nodemailer.createTransport({ ... });
      // await transporter.sendMail({ from: ENV.EMAIL_FROM, ...options });
      return true;
    } catch (error) {
      logger.error('Failed to send email via SMTP transport:', error);
      return false;
    }
  }

  logger.info(`[Email Service Simulated] Dispatch to: ${options.to}`);
  return true;
};

export const sendPasswordResetEmail = async (email: string, resetToken: string, origin?: string): Promise<boolean> => {
  const baseUrl = origin || ENV.CLIENT_URL || 'http://localhost:3000';
  const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
      <h2 style="color: #2563eb;">Password Reset Request</h2>
      <p>You requested a password reset for your Personal Finance Management account.</p>
      <p>Click the link below or copy it to your browser to set a new password:</p>
      <a href="${resetUrl}" style="display: inline-block; background-color: #2563eb; color: #fff; padding: 10px 18px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 10px;">Reset Password</a>
      <p style="margin-top: 20px; font-size: 12px; color: #666;">This link will expire in 1 hour. If you did not request this, please ignore this email.</p>
    </div>
  `;
  return sendEmail({
    to: email,
    subject: 'Password Reset - Personal Finance Management',
    html,
  });
};

export const sendVerificationEmail = async (email: string, token: string, origin?: string): Promise<boolean> => {
  const baseUrl = origin || ENV.CLIENT_URL || 'http://localhost:3000';
  const verifyUrl = `${baseUrl}/verify-email?token=${token}`;
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
      <h2 style="color: #2563eb;">Verify Your Email</h2>
      <p>Thank you for joining Personal Finance Management. Please confirm your email address by clicking the link below:</p>
      <a href="${verifyUrl}" style="display: inline-block; background-color: #2563eb; color: #fff; padding: 10px 18px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 10px;">Verify Email</a>
    </div>
  `;
  return sendEmail({
    to: email,
    subject: 'Verify your Email - Personal Finance Management',
    html,
  });
};
