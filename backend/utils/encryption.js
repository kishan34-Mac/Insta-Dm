import crypto from "crypto";

/**
 * Encryption Utility
 * Handles AES-256-GCM encryption for sensitive data
 */

//

// Get encryption key from environment (must be 32 characters for AES-256)
const getEncryptionKey = () => {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) {
    throw new Error("ENCRYPTION_KEY is not defined in environment variables");
  }
  // Ensure key is exactly 32 bytes for AES-256
  return crypto.createHash("sha256").update(key).digest();
};

// Encrypt text using AES-256-GCM
export const encrypt = (text) => {
  if (!text) return null;

  const iv = crypto.randomBytes(16); // 16 bytes IV for GCM
  const key = getEncryptionKey();
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);

  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag();

  // Return IV + authTag + encrypted data
  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted}`;
};

// Decrypt text using AES-256-GCM
export const decrypt = (encryptedText) => {
  if (!encryptedText) return null;

  try {
    const parts = encryptedText.split(":");
    if (parts.length !== 3) {
      throw new Error("Invalid encrypted text format");
    }

    const iv = Buffer.from(parts[0], "hex");
    const authTag = Buffer.from(parts[1], "hex");
    const encrypted = parts[2];
    const key = getEncryptionKey();

    const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch (err) {
    console.error("Decryption error:", err.message);
    throw new Error("Failed to decrypt data");
  }
};

export default { encrypt, decrypt };
