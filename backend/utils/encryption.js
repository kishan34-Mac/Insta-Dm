import crypto from "crypto";

// get 32-byte encryption key from env
const getEncryptionKey = () => {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) {
    throw new Error("ENCRYPTION_KEY is not defined in environment variables");
  }
  // Ensure key is exactly 32 bytes for AES-256
  return crypto.createHash("sha256").update(key).digest();
};

export const encrypt = (text) => {
  if (!text) return null;

  const iv = crypto.randomBytes(16); // 16 bytes IV for GCM
  const key = getEncryptionKey();
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);

  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag();

  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted}`;
};

export const decrypt = (encryptedText) => {
  if (!encryptedText) return null;

  try {
    const parts = encryptedText.split(":");
    if (parts.length !== 3) {
      return encryptedText; // Treat as legacy plaintext
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
    console.warn("Decryption failed, returning raw value (might be legacy plaintext):", err.message);
    return encryptedText;
  }
};

export default { encrypt, decrypt };
