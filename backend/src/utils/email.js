const nodemailer = require('nodemailer');

// Configure the transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER, 
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Sends an OTP email to the specified address.
 * 
 * @param {string} to - The recipient email address.
 * @param {string} otp - The plain 6-digit OTP.
 */
const sendOTPEmail = async (to, otp) => {
  const mailOptions = {
    from: `"Spotify Clone" <${process.env.SMTP_USER}>`,
    to: to,
    subject: 'Your Registration Verification Code',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <h2 style="color: #1ed760; text-align: center;">Welcome to Spotify Clone!</h2>
        <p style="font-size: 16px; color: #333;">You are just one step away from joining. Please use the verification code below to complete your registration:</p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="display: inline-block; padding: 15px 30px; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #fff; background-color: #121212; border-radius: 8px;">
            ${otp}
          </span>
        </div>
        <p style="font-size: 14px; color: #555;">This code will expire in <strong>10 minutes</strong>. Do not share this code with anyone.</p>
        <p style="font-size: 14px; color: #555; margin-top: 30px;">If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('OTP Email sent: %s', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending OTP Email:', error);
    throw new Error('Could not send OTP email. Please try again later.');
  }
};

module.exports = {
  sendOTPEmail,
};
