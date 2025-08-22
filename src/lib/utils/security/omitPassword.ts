import type { User, UserWithoutPassword } from '@db/schemas';

export const omitPassword = (user: User): UserWithoutPassword => {
  const { password: _password, ...userWithoutPassword } = user;
  return userWithoutPassword;
};
