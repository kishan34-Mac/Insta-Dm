import axios from "axios";

/**
 * Helper to sleep for exponential backoff delay
 */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Sends an automated Direct Message via Meta Graph API with retry strategy & exponential backoff.
 * 
 * @param {Object} params
 * @param {string} params.pageId - Facebook Page ID
 * @param {string} params.accessToken - Page Access Token
 * @param {string} [params.commentId] - Instagram comment ID (for private reply to comment)
 * @param {string} [params.recipientId] - Instagram user ID (for direct message reply)
 * @param {string} params.messageText - Text content of the DM
 * @param {number} [params.maxRetries=3] - Max retry attempts
 * @returns {Promise<{ success: boolean, data?: any, error?: string, attempts: number, latencyMs: number }>}
 */
export const sendAutoDM = async ({
  pageId,
  accessToken,
  commentId,
  recipientId,
  messageText,
  maxRetries = 3,
}) => {
  const url = `https://graph.facebook.com/v19.0/${pageId}/messages`;

  let recipientPayload = {};
  if (commentId) {
    recipientPayload = { comment_id: commentId };
  } else if (recipientId) {
    recipientPayload = { id: recipientId };
  } else {
    return {
      success: false,
      error: "Neither commentId nor recipientId provided for Meta DM delivery",
      attempts: 0,
      latencyMs: 0,
    };
  }

  const payload = {
    recipient: recipientPayload,
    message: {
      text: messageText,
    },
  };

  let attempts = 0;
  let lastError = null;
  const startTime = Date.now();

  while (attempts < maxRetries) {
    attempts++;
    try {
      console.log(`📤 [MetaService] Dispatching DM (Attempt ${attempts}/${maxRetries}) to ${commentId ? `comment:${commentId}` : `user:${recipientId}`}`);

      const response = await axios.post(url, payload, {
        params: {
          access_token: accessToken,
        },
        timeout: 10000,
      });

      const latencyMs = Date.now() - startTime;
      console.log(`✅ [MetaService] DM Sent Successfully in ${latencyMs}ms on attempt ${attempts}`);

      return {
        success: true,
        data: response.data,
        attempts,
        latencyMs,
      };
    } catch (err) {
      lastError = err.response?.data?.error || err.response?.data || err.message;
      const statusCode = err.response?.status;

      console.warn(`⚠️ [MetaService] Attempt ${attempts} failed (Status: ${statusCode || 'Network Error'}):`, JSON.stringify(lastError));

      // Do not retry on client auth errors (401, 403, 400 with invalid token/permissions)
      if (statusCode >= 400 && statusCode < 500 && statusCode !== 429) {
        const isRateLimit = err.response?.data?.error?.code === 4 || err.response?.data?.error?.code === 17;
        if (!isRateLimit) {
          console.error("❌ [MetaService] Non-retryable API error detected. Aborting retries.");
          break;
        }
      }

      // Exponential backoff delay: 200ms, 600ms, 1800ms
      const backoffMs = Math.pow(3, attempts - 1) * 200;
      await sleep(backoffMs);
    }
  }

  const latencyMs = Date.now() - startTime;
  const errorMessage = typeof lastError === "object" ? (lastError.message || JSON.stringify(lastError)) : String(lastError);

  console.error(`❌ [MetaService] All ${attempts} attempts to send DM failed after ${latencyMs}ms. Error: ${errorMessage}`);

  return {
    success: false,
    error: errorMessage,
    attempts,
    latencyMs,
  };
};
