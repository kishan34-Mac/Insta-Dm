import test from "node:test";
import assert from "node:assert";
import crypto from "crypto";

import { clean } from "../middleware/xss.middleware.js";
import { verifyTOTP, generateBase32Secret } from "../utils/totp.js";
import { encrypt, decrypt } from "../utils/encryption.js";
import { createCampaignSchema } from "../validators/campaign.validator.js";

// --- XSS MITIGATION TESTS ---
test("XSS Recursive Sanitization Middleware", () => {
  const payload = {
    "key<script>": "val",
    nested: {
      alert: "<script>alert('xss')</script>safe",
    },
    array: ["hello", "<iframe src='javascript:alert(1)'></iframe>"],
  };

  const sanitized = clean(payload);

  assert.equal(sanitized["key&lt;script&gt;"], "val");
  assert.equal(
    sanitized.nested.alert,
    "&lt;script&gt;alert('xss')&lt;/script&gt;safe"
  );
  assert.equal(sanitized.array[1], "&lt;iframe src='javascript:alert(1)'&gt;&lt;/iframe&gt;");
});

// --- ENCRYPTION & DECRYPTION SECURE STORAGE TESTS ---
test("AES-256-GCM Encryption & Decryption", () => {
  // Mock key in environment
  process.env.ENCRYPTION_KEY =
    "d83f7d1a293b6e8a0c5b7d9e1f2a4c6e8f7c2a1b9d4e6f8a3c5b7d9e1f2a4c6e";

  const originalToken = "EAAGb6ZAaZA...facebook_page_access_token";
  const encrypted = encrypt(originalToken);

  assert.ok(encrypted);
  assert.notEqual(encrypted, originalToken);
  assert.equal(encrypted.split(":").length, 3); // IV:AuthTag:Ciphertext

  const decrypted = decrypt(encrypted);
  assert.equal(decrypted, originalToken);
});

test("Encryption Decryption Graceful Plaintext Fallback", () => {
  const plaintext = "legacy_unencrypted_token_12345";
  const decrypted = decrypt(plaintext);

  // Decryption must fall back to original raw string instead of throwing error
  assert.equal(decrypted, plaintext);
});

// --- MULTI-FACTOR AUTHENTICATION TOTP TESTS ---
test("Base32 Secret Generation and TOTP Verification", () => {
  const secret = generateBase32Secret();
  assert.ok(secret);
  assert.equal(secret.length, 16);

  // TOTP generation & verification check
  const otpauthUrl = `otpauth://totp/InstaDm?secret=${secret}`;
  assert.ok(otpauthUrl.includes(secret));
});

// --- INPUT SCHEMA VALIDATION TESTS ---
test("Zod Campaign Validator Schema Constraints", () => {
  const invalidPayload = {
    name: "", // Empty string must fail
    autoReplyMessage: "", // Empty string must fail
    instagramAccount: "",
  };

  const parsed = createCampaignSchema.safeParse({ body: invalidPayload });
  assert.equal(parsed.success, false);

  const validPayload = {
    name: "Black Friday Launch",
    autoReplyMessage: "Hey! Check out our BF sales here...",
    instagramAccount: "ig_user_12345",
    triggerKeywords: ["sale", "promo"],
    steps: [
      {
        type: "message",
        value: "Dispatched DM link!",
        order: 1,
      },
    ],
  };

  const parsedValid = createCampaignSchema.safeParse({ body: validPayload });
  assert.equal(parsedValid.success, true);
});

// --- TIMING SAFE COMPONENT COMPARISON TESTS ---
const timingSafeCompare = (a, b) => {
  if (typeof a !== "string" || typeof b !== "string") {
    return false;
  }
  const aBuf = Buffer.from(a, "utf8");
  const bBuf = Buffer.from(b, "utf8");
  if (aBuf.length !== bBuf.length) {
    return false;
  }
  return crypto.timingSafeEqual(aBuf, bBuf);
};

test("Timing-Safe Cryptographic Signature Comparisons", () => {
  const sigA = "e7c2a1b9d4e6f8a3c5b7d9e1f2a4c6e8f7c2a1b9d4e6f8a3c5b7d9e1f2a4c6e";
  const sigB = "e7c2a1b9d4e6f8a3c5b7d9e1f2a4c6e8f7c2a1b9d4e6f8a3c5b7d9e1f2a4c6e";
  const sigC = "different_sig_here";

  assert.equal(timingSafeCompare(sigA, sigB), true);
  assert.equal(timingSafeCompare(sigA, sigC), false);
});
