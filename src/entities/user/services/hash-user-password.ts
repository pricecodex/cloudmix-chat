import { pbkdf2 } from "crypto";
import { promisify } from "util";

const pbkdf2Async = promisify(pbkdf2);

export async function hashPassword(password: string, salt: string) {
  const HASH_ALGO = "sha512";
  const ITERATIONS = 100_000; // OWASP recommends 100k+ for PBKDF2
  const KEY_LENGTH = 64; // 64 bytes = 512 bits

  const derivedKey = await pbkdf2Async(password, salt, ITERATIONS, KEY_LENGTH, HASH_ALGO);
  return derivedKey.toString("hex");
}
