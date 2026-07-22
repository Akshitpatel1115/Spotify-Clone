const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Sends an OTP email to the specified address using the Resend HTTP API.
 * 
 * @param {string} to - The recipient email address.
 * @param {string} otp - The plain 6-digit OTP.
 */
const sendOTPEmail = async (to, otp) => {
  if (!process.env.RESEND_API_KEY) {
    console.error('[Email Service] RESEND_API_KEY is not configured in .env');
    throw new Error('Email service is not properly configured.');
  }

  if (!process.env.EMAIL_FROM) {
    console.error('[Email Service] EMAIL_FROM is not configured in .env');
    throw new Error('Sender email is not properly configured.');
  }

  console.log(`[Email Service] Attempting to send OTP to ${to} via Resend...`);

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
      <h2 style="color: #1ed760; text-align: center;">Welcome to SONEXA!</h2>
      <p style="font-size: 16px; color: #333;">You are just one step away from joining. Please use the verification code below to complete your registration:</p>
      <div style="text-align: center; margin: 30px 0;">
        <span style="display: inline-block; padding: 15px 30px; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #fff; background-color: #121212; border-radius: 8px;">
          ${otp}
        </span>
      </div>
      <p style="font-size: 14px; color: #555;">This code will expire in <strong>10 minutes</strong>. Do not share this code with anyone.</p>
      <p style="font-size: 14px; color: #555; margin-top: 30px;">If you didn't request this, you can safely ignore this email.</p>
    </div>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: `SONEXA <${process.env.EMAIL_FROM}>`,
      to: to,
      subject: 'Your Registration Verification Code',
      html: htmlContent,
    });

    if (error) {
      console.error('[Email Service] Resend API Error:', error.message);
      throw new Error('Could not send OTP email via Resend.');
    }

    console.log('[Email Service] OTP Email successfully sent via Resend. ID:', data?.id);
    return data;
  } catch (error) {
    console.error('[Email Service] Unexpected error:', error.message);
    throw new Error('Could not send OTP email. Please try again later.');
  }
    };

/**
 * Sends a password reset OTP email to the specified address.
 */
const sendPasswordResetEmail = async (to, otp) => {
  if (!process.env.RESEND_API_KEY || !process.env.EMAIL_FROM) {
    throw new Error('Email service is not properly configured.');
  }

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
      <h2 style="color: #1ed760; text-align: center;">Reset Your Password</h2>
      <p style="font-size: 16px; color: #333;">We received a request to reset the password for your SONEXA account. Please use the verification code below to reset it:</p>
      <div style="text-align: center; margin: 30px 0;">
        <span style="display: inline-block; padding: 15px 30px; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #fff; background-color: #121212; border-radius: 8px;">
          ${otp}
        </span>
      </div>
      <p style="font-size: 14px; color: #555;">This code will expire in <strong>10 minutes</strong>. Do not share this code with anyone.</p>
      <p style="font-size: 14px; color: #555; margin-top: 30px;">If you didn't request a password reset, you can safely ignore this email.</p>
    </div>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: `SONEXA <${process.env.EMAIL_FROM}>`,
      to: to,
      subject: 'Password Reset Verification Code',
      html: htmlContent,
    });

    if (error) throw new Error(error.message);
    return data;
  } catch (error) {
    console.error('[Email Service] Unexpected error:', error.message);
    throw new Error('Could not send OTP email. Please try again later.');
  }
};

module.exports = {
  sendOTPEmail,
  sendPasswordResetEmail,
};
