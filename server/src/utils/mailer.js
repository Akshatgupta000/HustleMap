import nodemailer from 'nodemailer';

/**
 * Sends a password reset OTP to the user's email.
 * If SMTP credentials are not configured, it logs the OTP to the console.
 * 
 * @param {string} email 
 * @param {string} otp 
 */
export const sendOTPEmail = async (email, otp) => {
  const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
  const smtpPort = parseInt(process.env.SMTP_PORT || '465', 10);
  const smtpSecure = process.env.SMTP_SECURE !== 'false'; // defaults to true (port 465)
  const smtpUser = process.env.SMTP_USER || 'spotifysingh1947@gmail.com';
  const smtpPass = process.env.SMTP_PASS;

  // We can attempt sending a real email if password is provided
  const useRealEmail = !!smtpPass;

  if (useRealEmail) {
    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpSecure,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      const mailOptions = {
        from: `"HustleMap Support" <${smtpUser}>`,
        to: email,
        subject: 'HustleMap Password Reset OTP',
        text: `Your OTP for password reset is: ${otp}. It is valid for 15 minutes.`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px; background-color: #ffffff;">
            <div style="text-align: center; margin-bottom: 20px;">
              <span style="font-size: 24px; font-weight: bold; color: #1e293b; letter-spacing: -0.025em;">HustleMap</span>
            </div>
            <h2 style="color: #0f172a; text-align: center; margin-top: 0;">Password Reset Verification</h2>
            <p style="color: #334155; font-size: 15px; line-height: 1.5;">Hello,</p>
            <p style="color: #334155; font-size: 15px; line-height: 1.5;">We received a request to reset your HustleMap password. Use the following One-Time Password (OTP) to verify your request. This OTP is valid for <strong>15 minutes</strong>:</p>
            <div style="text-align: center; margin: 30px 0;">
              <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #10b981; background-color: #f1f5f9; padding: 12px 24px; border-radius: 8px; border: 1px solid #e2e8f0; display: inline-block;">${otp}</span>
            </div>
            <p style="color: #334155; font-size: 15px; line-height: 1.5;">If you did not request a password reset, you can safely ignore this email.</p>
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 25px 0;" />
            <p style="font-size: 12px; color: #64748b; text-align: center; margin: 0;">This is an automated message, please do not reply to this email.</p>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);
      console.log(`[Mailer] Real OTP email successfully sent to: ${email}`);
    } catch (error) {
      console.error(`[Mailer Error] Failed to send email to ${email}:`, error.message);
      // Still log to console as fallback so development is not blocked by SMTP errors
      logMockEmail(email, otp, smtpUser);
    }
  } else {
    logMockEmail(email, otp, smtpUser);
  }
};

/**
 * Logs mock email payload to server console.
 */
function logMockEmail(email, otp, fromEmail) {
  console.log('\n==================================================');
  console.log('                 [MOCK EMAIL SENT]                 ');
  console.log(` From:    ${fromEmail}`);
  console.log(` To:      ${email}`);
  console.log(` Subject: HustleMap Password Reset OTP`);
  console.log(` OTP:     ${otp} (Valid for 15 minutes)`);
  console.log('==================================================\n');
}
