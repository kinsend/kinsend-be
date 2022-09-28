import { compare, hash } from 'bcrypt';
import { sha256 } from 'js-sha256';

export const hashAndValidatePassword = async (
  password: string,
  saltRounds: number,
): Promise<string> => {
  return hash(password, saltRounds);
};

export const verify = async (password: string, hashPassword: string): Promise<boolean> => {
  if (!hashPassword) {
    return false;
  }
  return compare(password, hashPassword);
};

export const hashPassword = async (
  password: string,
  hashString: string,
  preHashSalt = 'hash-password',
): Promise<string> => {
  return sha256.hmac.update(preHashSalt, `${hashString}${preHashSalt}${password}`).hex();
};
