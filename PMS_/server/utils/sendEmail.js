require('dotenv').config();
const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // Use Ethereal or Mailtrap for dev testing if SMTP not provided
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.ethereal.email',
    port: process.env.EMAIL_PORT || 587,
    auth: {
      user: process.env.EMAIL_USER || 'ethereal_user', 
      pass: process.env.EMAIL_PASS || 'ethereal_pass',
    },
  });

  const mailOptions = {
    from: 'HR System <no-reply@pms-system.com>',
    to: options.email,
    subject: options.subject,
    html: options.html,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (err) {
    console.error("CRITICAL: SMTP EMAIL FAILED IN UTILITY:", err.message);
    // We do NOT rethrow here to prevent crashing parent controllers
  }
};

module.exports = sendEmail;
