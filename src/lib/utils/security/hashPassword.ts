import { logError } from '@lib';
import bcrypt from 'bcryptjs';

const saltRounds = 12;

const hashPassword = async (password: string): Promise<string> => {
  try {
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
  } catch (error) {
    const err = error as Error;
    logError(error, 'HASH_PASSWORD');
    throw new Error(`Failed to hash the password: ${err.message}`);
  }
};

const verifyPassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  try {
    return await bcrypt.compare(password, hashedPassword);
  } catch (error) {
    logError(error, 'VERIFY_PASSWORD');
    return false;
  }
};

export { hashPassword, verifyPassword };
