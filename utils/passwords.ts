import { BinaryLike, randomBytes, scrypt, ScryptOptions } from 'crypto';
import { PEPPER } from '../globals/Constants';

function scryptAsync(
  password: BinaryLike,
  salt: BinaryLike,
  keylen: number,
  options: ScryptOptions = {},
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, keylen, options, (err, derivedKey) => {
      if (err) {
        reject(err);
      } else {
        resolve(derivedKey);
      }
    });
  });
}

export async function generatePassword(plaintext: string, saltBuffer: Buffer = null): Promise<string> {
  const salt = saltBuffer ? saltBuffer : randomBytes(16);
  const plaintextWithPepper = [plaintext, PEPPER].join('.');
  const generated = await scryptAsync(plaintextWithPepper, salt, 128);
  return [
    salt.toString('hex'),
    generated.toString('base64'),
  ].join('.');
}

export async function verifyPassword(plaintext: string, cipherText: string): Promise<boolean> {
  const decomposed = cipherText.split('.');
  const generated = await generatePassword(plaintext, Buffer.from(decomposed[0], 'hex'));
  return cipherText === generated;
}
