import env from "../config/env.js";

/**
 * Mock email dispatcher service. Logs tokens and links to console for local testing.
 * Can be integrated with nodemailer or any transactional email provider.
 */
export const sendVerificationEmail = async (email, token) => {
  const verificationLink = `${env.FRONTEND_URL}/verify-email?token=${token}`;
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║                   EMAIL VERIFICATION DISPATCH                  ║
╠════════════════════════════════════════════════════════════════╣
║ To      : ${email}
║ Link    : ${verificationLink}
║ Expires : In 24 Hours
╚════════════════════════════════════════════════════════════════╝
  `);
  return true;
};

export const sendPasswordResetEmail = async (email, token) => {
  const resetLink = `${env.FRONTEND_URL}/reset-password?token=${token}`;
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║                   PASSWORD RESET DISPATCH                      ║
╠════════════════════════════════════════════════════════════════╣
║ To      : ${email}
║ Link    : ${resetLink}
║ Expires : In 1 Hour
╚════════════════════════════════════════════════════════════════╝
  `);
  return true;
};

export const sendPasswordResetConfirmation = async (email) => {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║                   PASSWORD RESET CONFIRMATION                  ║
╠════════════════════════════════════════════════════════════════╣
║ To      : ${email}
║ Status  : Your password has been successfully reset.
╚════════════════════════════════════════════════════════════════╝
  `);
  return true;
};

export default {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendPasswordResetConfirmation,
};
