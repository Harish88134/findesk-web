// server/src/services/user.service.ts
import bcrypt from 'bcryptjs';
import { dbStore } from '../repositories/db.store';

export class UserService {
  async getProfile(userId: string) {
    const user = await dbStore.findUserById(userId);
    if (!user) {
      throw new Error('User not found.');
    }
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async updateProfile(userId: string, updates: { name?: string; avatar?: string; currency?: string }) {
    const updated = await dbStore.updateUser(userId, updates);
    if (!updated) {
      throw new Error('User could not be updated.');
    }
    const { password, ...userWithoutPassword } = updated;
    return userWithoutPassword;
  }

  async changePassword(userId: string, currentPass: string, newPass: string) {
    const user = await dbStore.findUserById(userId);
    if (!user || !user.password) {
      throw new Error('User not found.');
    }

    const isMatch = await bcrypt.compare(currentPass, user.password);
    if (!isMatch) {
      throw new Error('Current password does not match.');
    }

    const hashed = await bcrypt.hash(newPass, 10);
    await dbStore.updateUser(userId, { password: hashed });
    return true;
  }

  async deleteAccount(userId: string) {
    return await dbStore.deleteUser(userId);
  }
}

export const userService = new UserService();
