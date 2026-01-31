import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();
interface EmailOptions {
  name: string;
  email: string;
  role: string;
}
console.log('AUTH CHECK:', {
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASS: process.env.EMAIL_PASS ? 'SET' : 'MISSING',
});

// Create the transporter with detailed logging
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});


export const sendWelcomeEmail = async ({ name, email, role }: EmailOptions): Promise<void> => {
  console.log('📧 Preparing to send welcome email...');
  console.log(`📧 Email details: Name: ${name}, Email: ${email}, Role: ${role}`);

  // Validate environment variables
  if (!process.env.EMAIL_HOST || !process.env.EMAIL_PORT || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error('❌ Missing required email configuration environment variables.');
    throw new Error('Missing required email configuration environment variables.');
  }

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Welcome to Dynamic Dashboard',
    html: `
      <h2>Hello ${name},</h2>
      <p>You have been added as a <strong>${role}</strong> in Dynamic Dashboard.</p>
      <p>Please sign in using your Google account to access the system.</p>
      <a href="${process.env.FRONTEND_URL}/login">Login Here</a>
    `,
  };

  try {
    console.log('📧 Connecting to SMTP server...');
    console.log(`📧 SMTP Host: ${process.env.EMAIL_HOST}`);
    console.log(`📧 SMTP Port: ${process.env.EMAIL_PORT}`);
    console.log(`📧 Sending email to: ${email}`);

    // Send the email
    const info = await transporter.sendMail(mailOptions);

    console.log('✅ Email sent successfully!');
    console.log(`📧 Message ID: ${info.messageId}`);
    console.log(`📧 Preview URL: ${nodemailer.getTestMessageUrl(info) || 'N/A'}`);
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to send email: ${error.message}`);
    } else {
      throw new Error('Failed to send email due to an unknown error.');
    }
  }
};