import { logError } from '@lib';
import nodemailer from 'nodemailer';

// A transporter object using SMTP settings
const transporter = nodemailer.createTransport({
  service: 'gmail',
  secure: true,
  host: 'smtp.gmail.com',
  port: 465,
  auth: {
    user: process.env.NODE_MAILER_EMAIL,
    pass: process.env.NODE_MAILER_EMAIL_PASSWORD,
  },
});

// A function to send an email
export const sendEmail = async (
  sender: string,
  receiver: string,
  subject: string,
  text: string,
  htmlContent?: string,
) => {
  const mailOptions = {
    from: sender,
    to: receiver,
    subject,
    text,
    html: htmlContent ?? text,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    logError(error, 'EMAIL');
  }
};
