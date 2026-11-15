// server/src/services/auth.service.ts
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { dbStore } from '../repositories/db.store';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { sendVerificationEmail, sendPasswordResetEmail } from '../utils/email';
import { IUser, IAuthTokens } from '../interfaces';

export class AuthService {
  async register(data: { name: string; email: string; password: string }) {
    const existing = await dbStore.findUserByEmail(data.email);
    if (existing) {
      throw new Error('An account with this email address already exists.');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const verificationToken = crypto.randomBytes(32).toString('hex');

    const newUser = await dbStore.createUser({
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: 'user',
      isEmailVerified: true,
      emailVerificationToken: verificationToken,
    });

    await sendVerificationEmail(newUser.email, verificationToken);

    const tokens = this.generateUserTokens(newUser);
    await dbStore.saveRefreshToken(
      newUser._id,
      tokens.refreshToken,
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    );

    // Initial greeting notification
    await dbStore.createNotification({
      userId: newUser._id,
      title: 'Welcome to Personal Finance Hub',
      message: 'Your account is ready. Begin by setting up your monthly budget and logging income or expenses.',
      type: 'system',
    });

    const { password, ...userWithoutPassword } = newUser;
    return { user: userWithoutPassword, tokens };
  }

  async login(data: { email: string; password: string }) {
    const user = await dbStore.findUserByEmail(data.email);
    if (!user || !user.password) {
      throw new Error('Invalid email or password.');
    }

    const isMatch = await bcrypt.compare(data.password, user.password);
    if (!isMatch) {
      throw new Error('Invalid email or password.');
    }

    const tokens = this.generateUserTokens(user);
    await dbStore.saveRefreshToken(
      user._id,
      tokens.refreshToken,
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    );

    const { password, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, tokens };
  }

  async refreshToken(token: string) {
    const decoded = verifyRefreshToken(token);
    if (!decoded) {
      throw new Error('Refresh token is invalid or expired.');
    }

    const storedToken = await dbStore.findRefreshToken(token);
    if (!storedToken) {
      throw new Error('Refresh token revoked or not found.');
    }

    const user = await dbStore.findUserById(decoded.userId);
    if (!user) {
      throw new Error('User no longer exists.');
    }

    await dbStore.revokeRefreshToken(token);
    const tokens = this.generateUserTokens(user);
    await dbStore.saveRefreshToken(
      user._id,
      tokens.refreshToken,
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    );

    return tokens;
  }

  async logout(token: string) {
    if (token) {
      await dbStore.revokeRefreshToken(token);
    }
    return true;
  }

  async forgotPassword(email: string) {
    const user = await dbStore.findUserByEmail(email);
    if (!user) {
      // Return true to avoid user enumeration attacks
      return true;
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await dbStore.updateUser(user._id, {
      passwordResetToken: resetToken,
      passwordResetExpires: resetExpires,
    });

    await sendPasswordResetEmail(user.email, resetToken);
    return true;
  }

  async resetPassword(token: string, newPassword: string) {
    const allUsers = await dbStore.getAllUsers();
    // Look up user with matching token and valid expiry
    const user = (dbStore as any)['users'].find(
      (u: IUser) =>
        u.passwordResetToken === token &&
        u.passwordResetExpires &&
        new Date(u.passwordResetExpires) > new Date()
    );

    if (!user) {
      throw new Error('Password reset token is invalid or has expired.');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await dbStore.updateUser(user._id, {
      password: hashedPassword,
      passwordResetToken: undefined,
      passwordResetExpires: undefined,
    });

    return true;
  }

  private generateUserTokens(user: IUser): IAuthTokens {
    const payload = {
      userId: user._id,
      email: user.email,
      role: user.role,
    };

    return {
      accessToken: generateAccessToken(payload),
      refreshToken: generateRefreshToken(payload),
    };
  }
}

export const authService = new AuthService();
