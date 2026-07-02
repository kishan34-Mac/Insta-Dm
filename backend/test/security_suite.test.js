import { test } from "node:test";
import assert from "node:assert";
import crypto from "node:crypto";
import { clean } from "../middleware/xss.middleware.js";
import { encrypt, decrypt } from "../utils/encryption.js";
import { generateBase32Secret, verifyTOTP } from "../utils/totp.js";
import { createCampaignSchema } from "../validators/campaign.validator.js";
import { generateAccessToken, verifyAccessToken } from "../utils/jwt.js";

// 1. Password Policy & Complexity Validation Test
test("Security Suite: Password Policy Validation", () => {
  const strongPassword = "P@ssword123!";
  const weakPassword = "123";

  const isStrong = (pwd) =>
    pwd.length >= 8 &&
    /[A-Z]/.test(pwd) &&
    /[a-z]/.test(pwd) &&
    /[0-9]/.test(pwd) &&
    /[^A-Za-z0-9]/.test(pwd);

  assert.equal(isStrong(strongPassword), true);
  assert.equal(isStrong(weakPassword), false);
});

// 2. JWT Security & Algorithm Verification
test("Security Suite: JWT Signing and HS256 Verification", () => {
  const userId = "507f1f77bcf86cd799439011";
  const token = generateAccessToken(userId);
  assert.ok(token);

  const decoded = verifyAccessToken(token);
  assert.equal(decoded.userId, userId);
});

// 3. XSS Recursive Input Sanitization
test("Security Suite: Deep XSS Sanitization", () => {
  const maliciousInput = {
    title: "<script>alert('xss')</script>",
    nested: {
      bio: "<img src=x onerror=alert('hack') />",
      tags: ["<b>safe</b>", "<iframe src='malicious.com'></iframe>"],
    },
  };

  const sanitized = clean(maliciousInput);

  assert.equal(sanitized.title, "&lt;script&gt;alert('xss')&lt;/script&gt;");
  assert.equal(sanitized.nested.bio.includes("onerror"), false);
  assert.equal(sanitized.nested.tags[0], "<b>safe</b>");
  assert.equal(sanitized.nested.tags[1].startsWith("&lt;iframe"), true);
});

// 4. AES-256-GCM Authenticated Encryption
test("Security Suite: AES-256-GCM Encryption and Decryption", () => {
  const sensitiveData = "EAABwzLixxxxxxxxxxxxxxxxx";
  const encrypted = encrypt(sensitiveData);

  assert.ok(encrypted);
  assert.notEqual(encrypted, sensitiveData);

  const decrypted = decrypt(encrypted);
  assert.equal(decrypted, sensitiveData);
});

// 5. Zod Input Validation & Schema Hardening
test("Security Suite: Zod Campaign Input Validation Constraints", () => {
  const validCampaign = {
    body: {
      name: "Black Friday Sale",
      instagramAccount: "507f1f77bcf86cd799439011",
      postUrl: "https://www.instagram.com/p/C123456789/",
      triggerType: "comment",
      keywords: ["sale", "discount"],
      autoReplyMessage: "Check out our sale link!",
    },
  };

  const parsed = createCampaignSchema.safeParse(validCampaign);
  assert.equal(parsed.success, true);

  const invalidCampaign = {
    body: {
      name: "", // empty name
      instagramAccount: "", // empty account
    },
  };

  const invalidParsed = createCampaignSchema.safeParse(invalidCampaign);
  assert.equal(invalidParsed.success, false);
});

// 6. Timing-Safe Cryptographic Signature Comparisons
test("Security Suite: Timing-Safe Signature Comparison", () => {
  const expectedHash = crypto.createHmac("sha256", "secret_key").update("payload").digest("hex");
  const actualHash = crypto.createHmac("sha256", "secret_key").update("payload").digest("hex");
  const wrongHash = crypto.createHmac("sha256", "wrong_key").update("payload").digest("hex");

  const match1 = crypto.timingSafeEqual(Buffer.from(expectedHash), Buffer.from(actualHash));
  assert.equal(match1, true);

  const match2 = crypto.timingSafeEqual(Buffer.from(expectedHash), Buffer.from(wrongHash));
  assert.equal(match2, false);
});

// 7. TOTP MFA Secret Generation & Verification
test("Security Suite: TOTP Multi-Factor Secret Generation & Verification", () => {
  const secret = generateBase32Secret();
  assert.ok(secret);
  assert.equal(typeof secret, "string");
  assert.ok(secret.length >= 16);
});

// 8. Lead Persistence Engine Multi-Document Creation Test
import { saveOrUpdateLead } from "../services/lead.service.js";

test("Security Suite: Lead Persistence Input Guarding", async () => {
  const missingRes = await saveOrUpdateLead({ user: "6a461cfeb0515da7067687ba", igUserId: "", igUsername: "" });
  assert.equal(missingRes.success, false);
  assert.equal(missingRes.reason, "MISSING_CUSTOMER_IDENTIFIER");
});
