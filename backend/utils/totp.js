import crypto from "crypto";

/**
 * Decodes a base32 encoded string into a Buffer.
 * Supports standard RFC 4648 base32 alphabet.
 */
function base32Decode(base32) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  const cleaned = base32.replace(/=+$/, "").toUpperCase();
  let bits = "";
  
  for (let i = 0; i < cleaned.length; i++) {
    const val = alphabet.indexOf(cleaned[i]);
    if (val === -1) {
      throw new Error("Invalid base32 character");
    }
    bits += val.toString(2).padStart(5, "0");
  }
  
  const bytes = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(parseInt(bits.substring(i, i + 8), 2));
  }
  
  return Buffer.from(bytes);
}

/**
 * Generates a random base32 secret.
 */
export function generateBase32Secret(length = 16) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  const bytes = crypto.randomBytes(length);
  let secret = "";
  for (let i = 0; i < bytes.length; i++) {
    secret += alphabet[bytes[i] % alphabet.length];
  }
  return secret;
}

/**
 * Verifies a 6-digit TOTP token against a base32 secret.
 * Allows a verification window (default +/- 1 step) to account for time drift.
 */
export function verifyTOTP(token, secret, window = 1, timeStep = 30) {
  try {
    const key = base32Decode(secret);
    const counter = Math.floor(Date.now() / 1000 / timeStep);

    for (let i = -window; i <= window; i++) {
      const buffer = Buffer.alloc(8);
      // Write the 64-bit integer counter value
      const currentCounter = BigInt(counter + i);
      buffer.writeBigInt64BE(currentCounter);

      const hmac = crypto
        .createHmac("sha1", key)
        .update(buffer)
        .digest();

      const offset = hmac[hmac.length - 1] & 0xf;
      const codeVal =
        ((hmac[offset] & 0x7f) << 24) |
        ((hmac[offset + 1] & 0xff) << 16) |
        ((hmac[offset + 2] & 0xff) << 8) |
        (hmac[offset + 3] & 0xff);

      const generatedToken = String(codeVal % 1000000).padStart(6, "0");
      if (generatedToken === token) {
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error("MFA TOTP Verification failed:", error.message);
    return false;
  }
}

export default {
  generateBase32Secret,
  verifyTOTP,
};
